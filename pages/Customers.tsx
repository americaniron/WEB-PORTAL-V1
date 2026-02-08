import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Customer } from '../types';
import { Building, Search, Plus, ExternalLink, ShieldCheck, DollarSign, ArrowUpRight } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const data = await api.customers.getAll();
        setCustomers(data);
      } catch (err) {
        console.error("Failed to fetch customers");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-950 uppercase tracking-tight font-heading">Global Account Matrix</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Enterprise CRM & Ledger Controls</p>
        </div>
        <button className="inline-flex items-center px-6 py-2.5 rounded-xl shadow-lg shadow-red-900/20 text-[11px] font-black text-white bg-red-700 hover:bg-red-800 transition-all uppercase tracking-widest">
          <Plus className="w-3.5 h-3.5 mr-2" />
          Initialize Account
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 bg-zinc-50 border-zinc-200 rounded-xl focus:ring-red-500/20 focus:border-red-500 transition-all text-xs font-bold uppercase tracking-widest py-3 border"
            placeholder="Scan account registry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-zinc-100 animate-pulse"></div>
          ))
        ) : filteredCustomers.map((customer) => {
          const balance = (customer.total_billed || 0) - (customer.total_paid || 0);
          return (
            <Link to={`/customers/${customer.id}`} key={customer.id} className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 hover:border-red-700 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-bl-full -mr-16 -mt-16 group-hover:bg-red-50 transition-colors"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-xl shadow-slate-950/20">
                      <Building className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight font-heading group-hover:text-red-700 transition-colors leading-tight">
                        {customer.name}
                      </h3>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{customer.email}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-zinc-300 group-hover:text-red-700 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>

                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-zinc-100">
                  <div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Gross Billed</p>
                    <p className="text-sm font-black text-slate-950 tracking-tight">${(customer.total_billed || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Total Receipts</p>
                    <p className="text-sm font-black text-emerald-700 tracking-tight">${(customer.total_paid || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Balance Due</p>
                    <p className={`text-sm font-black tracking-tight ${balance > 0 ? 'text-red-700' : 'text-slate-400'}`}>
                      ${balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {!loading && filteredCustomers.length === 0 && (
        <div className="p-20 text-center bg-white rounded-2xl border border-zinc-200 border-dashed">
          <Building className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">No matching customer profiles found</p>
        </div>
      )}
    </div>
  );
};

export default Customers;