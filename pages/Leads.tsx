import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Lead } from '../types';
import { Search, Filter, Download, Plus, Mail, Phone, Calendar, UserPlus } from 'lucide-react';

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await api.leads.getAll();
        setLeads(data);
      } catch (err) {
        console.error('Failed to fetch leads');
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-catblack uppercase tracking-tight font-heading leading-none">Opportunity Hub</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Lead Capture & Pipeline Management</p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center px-5 py-2.5 border border-zinc-200 rounded-xl shadow-sm text-[11px] font-black uppercase tracking-widest text-zinc-600 bg-white hover:bg-zinc-50 transition-all">
            <Download className="w-3.5 h-3.5 mr-2" />
            Export Archive
          </button>
          <button className="inline-flex items-center px-6 py-2.5 rounded-xl shadow-lg shadow-catyellow/20 text-[11px] font-black text-catblack bg-catyellow hover:bg-[#E6B800] transition-all uppercase tracking-widest">
            <UserPlus className="w-3.5 h-3.5 mr-2" />
            New Prospect
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 bg-zinc-50 border-zinc-200 rounded-xl focus:ring-catyellow focus:border-catyellow transition-all text-xs font-bold uppercase tracking-widest py-3 border"
            placeholder="Search leads registry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center px-6 py-3 border border-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600 bg-white hover:bg-zinc-50 transition-all">
          <Filter className="w-3.5 h-3.5 mr-2" />
          Filter Parameters
        </button>
      </div>

      <div className="bg-white shadow-xl shadow-slate-950/5 border border-zinc-200 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr className="text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest font-heading">
                <th className="px-8 py-5">Prospect Identity</th>
                <th className="px-8 py-5">Telemetry Details</th>
                <th className="px-8 py-5 text-center">Inbound Source</th>
                <th className="px-8 py-5 text-center">Status Matrix</th>
                <th className="px-8 py-5 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-5"><div className="h-4 bg-zinc-100 rounded w-48 mb-2"></div><div className="h-3 bg-zinc-50 rounded w-24"></div></td>
                    <td className="px-8 py-5"><div className="h-4 bg-zinc-100 rounded w-40 mb-2"></div><div className="h-4 bg-zinc-100 rounded w-40"></div></td>
                    <td className="px-8 py-5"><div className="h-5 bg-zinc-100 rounded-full w-24 mx-auto"></div></td>
                    <td className="px-8 py-5"><div className="h-5 bg-zinc-100 rounded-full w-16 mx-auto"></div></td>
                    <td className="px-8 py-5 text-right"><div className="h-4 bg-zinc-100 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-zinc-50/80 transition-all cursor-pointer group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-catblack group-hover:text-catyellow transition-colors uppercase tracking-tight">{lead.name}</span>
                      {lead.is_newsletter_subscriber && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black bg-catblack text-catyellow mt-2 uppercase tracking-widest w-fit">
                          Verified Subscriber
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center text-[11px] text-zinc-600 font-bold tracking-tight">
                        <Mail className="w-3 h-3 mr-2 text-zinc-400" /> {lead.email}
                      </div>
                      <div className="flex items-center text-[11px] text-zinc-600 font-bold tracking-tight">
                        <Phone className="w-3 h-3 mr-2 text-zinc-400" /> {lead.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black bg-zinc-100 text-zinc-800 uppercase tracking-widest border border-zinc-200">
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black bg-zinc-100 text-zinc-500 border border-zinc-200 uppercase tracking-widest">
                      Unqualified
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right text-[11px] font-bold text-zinc-400">
                    <div className="flex items-center justify-end gap-2 uppercase tracking-tighter">
                      <Calendar className="w-3 h-3" />
                      {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filteredLeads.length === 0 && (
          <div className="p-20 text-center">
            <Search className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">No matching prospects found in registry</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads;