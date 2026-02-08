import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { Lead, Quote, SystemHealth } from '../types';
import { Activity, ShieldCheck, Box, Clock, TrendingUp, AlertCircle, Database } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ leads: 0, revenue: 0, pending: 0 });
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leads, quotes, healthData] = await Promise.all([
          api.leads.getAll(),
          api.quotes.getAll(),
          api.health.check()
        ]);
        
        const revenue = quotes
          .filter(q => q.status === 'accepted')
          .reduce((sum, q) => sum + q.quote_details.items.reduce((s, i) => s + (i.price * i.quantity), 0), 0);

        setStats({ leads: leads.length, revenue, pending: quotes.filter(q => q.status === 'sent' || q.status === 'draft').length });
        setHealth(healthData);
      } catch (error) {
        console.error("Operational Hub Service Interrupted");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const throughputData = [
    { name: '00:00', reqs: 45 },
    { name: '04:00', reqs: 120 },
    { name: '08:00', reqs: 890 },
    { name: '12:00', reqs: 750 },
    { name: '16:00', reqs: 1100 },
    { name: '20:00', reqs: 420 },
  ];

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white rounded-xl shadow-sm border border-zinc-200 animate-pulse"></div>)}
      </div>
      <div className="h-96 bg-white rounded-xl shadow-sm border border-zinc-200 animate-pulse"></div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-catblack uppercase tracking-tight font-heading leading-none">Terminal Dashboard</h1>
          <p className="text-zinc-500 font-medium uppercase tracking-widest text-[10px] flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Real-time Operational Metrics Monitoring
          </p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-zinc-200 rounded-full shadow-sm hover:border-catyellow transition-colors">
          <Database className="w-4 h-4 text-zinc-400" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">Database Sync</span>
            <span className="text-xs font-black text-catblack uppercase tracking-tighter leading-none">Healthy // Node-04</span>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard label="Open Opportunities" value={stats.leads} icon={TrendingUp} trend="+12% vs LW" color="text-catblack" bg="bg-catyellow" />
        <KpiCard label="Confirmed Billing" value={`$${stats.revenue.toLocaleString()}`} icon={ShieldCheck} trend="Stable" color="text-emerald-700" bg="bg-emerald-50" />
        <KpiCard label="Unreconciled Doc" value={stats.pending} icon={Box} trend="Needs Action" color="text-blue-700" bg="bg-blue-50" />
        <KpiCard label="Core API Uptime" value={health?.status === 'operational' ? '99.99%' : 'Degraded'} icon={Activity} trend="Operational" color="text-catblack" bg="bg-zinc-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Graph */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm transition-all hover:shadow-md">
           <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                 <Activity className="w-5 h-5 text-catyellow" />
               </div>
               <div>
                 <h3 className="text-sm font-black text-catblack uppercase tracking-widest font-heading">Global Hub Traffic</h3>
                 <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Requests Per Minute (RPM)</p>
               </div>
             </div>
             <div className="hidden sm:flex gap-4">
                <span className="flex items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-catyellow mr-2"></span>Direct API</span>
                <span className="flex items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-catblack mr-2"></span>WebSocket</span>
             </div>
           </div>
           <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={throughputData}>
                 <defs>
                   <linearGradient id="colorReqs" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#FFCD00" stopOpacity={0.15}/>
                     <stop offset="95%" stopColor="#FFCD00" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                 <Tooltip 
                   contentStyle={{borderRadius: '12px', border: 'none', backgroundColor: '#111111', color: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                   itemStyle={{fontWeight: 900, fontSize: '12px', textTransform: 'uppercase'}}
                 />
                 <Area type="monotone" dataKey="reqs" stroke="#FFCD00" strokeWidth={4} fillOpacity={1} fill="url(#colorReqs)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* System Health / Status */}
        <div className="bg-catblack p-8 rounded-2xl border border-zinc-800 shadow-2xl text-white flex flex-col">
           <div className="flex items-center justify-between mb-10">
             <h3 className="text-sm font-black text-catyellow uppercase tracking-widest font-heading">Service Perimeter</h3>
             <AlertCircle className="w-4 h-4 text-zinc-600" />
           </div>
           
           <div className="space-y-8 flex-1">
              <HealthItem label="Core Inventory Service" active={health?.services.inventory || false} lastPing="2ms" />
              <HealthItem label="Global Billing Gateway" active={health?.services.billing || false} lastPing="14ms" />
              <HealthItem label="User Authentication Hub" active={health?.services.auth || false} lastPing="5ms" />
              <HealthItem label="Gemini Intelligence Node" active={health?.services.ai || false} lastPing="245ms" />
           </div>

           <div className="mt-auto pt-8 border-t border-zinc-900 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Environment</span>
                <span className="text-xs font-black text-white uppercase tracking-tighter">Production Cluster</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Region</span>
                <span className="text-xs font-black text-white uppercase tracking-tighter">US-EAST-01</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, icon: Icon, trend, color, bg }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center group hover:border-catyellow transition-all cursor-default">
    <div className={`p-4 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform mr-6`}>
      <Icon className="w-7 h-7" />
    </div>
    <div className="flex flex-col">
      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-2">{label}</p>
      <p className="text-3xl font-black text-catblack font-heading leading-none mb-2">{value}</p>
      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
        <TrendingUp className="w-3 h-3 text-emerald-500" /> {trend}
      </span>
    </div>
  </div>
);

const HealthItem = ({ label, active, lastPing }: { label: string, active: boolean, lastPing: string }) => (
  <div className="flex items-center justify-between group">
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
      <span className="text-[9px] text-zinc-600 font-mono mt-1">LATENCY: {lastPing}</span>
    </div>
    <div className="relative">
      {active && <div className="absolute inset-0 bg-emerald-500 rounded-full blur-sm opacity-50 animate-pulse"></div>}
      <div className={`w-3 h-3 rounded-full relative z-10 ${active ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
    </div>
  </div>
);

export default Dashboard;