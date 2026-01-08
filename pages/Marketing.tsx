import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MarketingCampaign } from '../types';
import { Mail, Send, Plus, PauseCircle } from 'lucide-react';

const Marketing = () => {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await api.marketing.getAll();
        setCampaigns(data);
      } catch (err) {
        console.error("Failed to fetch campaigns");
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'sent': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'sending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 uppercase font-heading">Marketing Campaigns</h1>
          <p className="text-sm text-slate-500 mt-1">Manage email blasts and newsletters</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded shadow-sm text-sm font-bold text-white bg-red-700 hover:bg-red-800 transition-colors uppercase tracking-wider">
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Skeleton Cards
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 bg-slate-200 rounded"></div>
                <div className="h-6 w-16 bg-slate-200 rounded"></div>
              </div>
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-12"></div>
              </div>
            </div>
          ))
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-slate-100 rounded">
                    <Mail className="w-6 h-6 text-slate-600" />
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase border ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">{campaign.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{campaign.subject}</p>
                
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                  <div className="flex space-x-2">
                     {campaign.status === 'draft' && (
                       <button className="text-red-700 hover:text-red-900 text-sm font-bold flex items-center uppercase tracking-wide">
                         <Send className="w-4 h-4 mr-1" /> Send
                       </button>
                     )}
                     {campaign.status === 'sending' && (
                       <button className="text-amber-600 hover:text-amber-800 text-sm font-bold flex items-center uppercase tracking-wide">
                         <PauseCircle className="w-4 h-4 mr-1" /> Pause
                       </button>
                     )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Placeholder for New Campaign Card Style */}
        {!loading && (
          <button className="bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-slate-500 hover:border-red-500 hover:text-red-600 transition-colors group">
            <div className="p-3 rounded-full bg-slate-200 group-hover:bg-red-100 transition-colors mb-3">
               <Plus className="w-8 h-8" />
            </div>
            <span className="font-bold uppercase tracking-wide">Create New Campaign</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Marketing;