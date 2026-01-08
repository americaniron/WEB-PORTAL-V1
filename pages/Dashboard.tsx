import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { api } from '../services/api';
import { Lead, Quote } from '../types';
import { TrendingUp, Users, FileCheck, DollarSign } from 'lucide-react';

const Dashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsData, quotesData] = await Promise.all([
          api.leads.getAll(),
          api.quotes.getAll()
        ]);
        setLeads(leadsData);
        setQuotes(quotesData);
      } catch (error) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = quotes
    .filter(q => q.status === 'accepted' || q.status === 'sent')
    .reduce((sum, q) => sum + q.quote_details.items.reduce((s, i) => s + (i.price * i.quantity), 0), 0);

  const stats = [
    { name: 'Total Leads', value: leads.length, icon: Users, color: 'text-slate-700', bg: 'bg-slate-200' },
    { name: 'Active Quotes', value: quotes.length, icon: FileCheck, color: 'text-red-700', bg: 'bg-red-100' },
    { name: 'Conversion Rate', value: '24%', icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-100' },
    { name: 'Est. Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-blue-900', bg: 'bg-blue-100' },
  ];

  // Mock data for charts
  const chartData = [
    { name: 'Mon', leads: 4, quotes: 2 },
    { name: 'Tue', leads: 3, quotes: 1 },
    { name: 'Wed', leads: 7, quotes: 5 },
    { name: 'Thu', leads: 5, quotes: 3 },
    { name: 'Fri', leads: 8, quotes: 6 },
    { name: 'Sat', leads: 2, quotes: 1 },
    { name: 'Sun', leads: 1, quotes: 0 },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow-sm border border-slate-200 rounded-lg p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md p-3 bg-slate-200 h-12 w-12"></div>
                <div className="ml-5 w-0 flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-96">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-slate-100 rounded w-full"></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-96">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-slate-100 rounded w-full"></div>
          </div>
        </div>

        {/* Leads Skeleton */}
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-50 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow-sm border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${item.bg}`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate font-heading uppercase">{item.name}</dt>
                    <dd className="text-2xl font-semibold text-slate-900">{item.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase font-heading">Weekly Activity</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} />
                <YAxis tick={{fill: '#64748b'}} axisLine={false} />
                <Tooltip contentStyle={{backgroundColor: '#1e293b', color: '#fff', border: 'none'}} />
                <Bar dataKey="leads" fill="#0f172a" name="New Leads" radius={[2, 2, 0, 0]} />
                <Bar dataKey="quotes" fill="#b91c1c" name="Quotes Sent" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase font-heading">Lead Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} />
                <YAxis tick={{fill: '#64748b'}} axisLine={false} />
                <Tooltip contentStyle={{backgroundColor: '#1e293b', color: '#fff', border: 'none'}} />
                <Line type="monotone" dataKey="leads" stroke="#b91c1c" strokeWidth={3} dot={{ r: 4, fill: '#b91c1c' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Leads Preview */}
      <div className="bg-white shadow-sm rounded-lg border border-slate-200">
        <div className="px-4 py-5 border-b border-slate-100 sm:px-6 bg-slate-50">
          <h3 className="text-lg leading-6 font-bold text-slate-900 uppercase font-heading">Recent Leads</h3>
        </div>
        <ul className="divide-y divide-slate-100">
          {leads.slice(0, 3).map((lead) => (
            <li key={lead.id} className="px-4 py-4 sm:px-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-800 truncate">{lead.name}</p>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className="px-2 inline-flex text-xs leading-5 font-bold rounded bg-slate-200 text-slate-700 uppercase">
                    {lead.source}
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-slate-500">
                    {lead.email}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0">
                  <p>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;