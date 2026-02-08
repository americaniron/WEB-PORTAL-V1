import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { DetailedQuote } from '../types';
import { Hammer, Printer, ArrowLeft, ShieldCheck, Download, Globe, FileText } from 'lucide-react';

const QuoteDetail = () => {
    const { id } = useParams();
    const [quote, setQuote] = useState<DetailedQuote | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuote = async () => {
            if (id) {
                try {
                    const data = await api.quotes.getDetailedById(id);
                    setQuote(data);
                } catch (error) {
                    console.error("Failed to fetch quote details", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchQuote();
    }, [id]);

    if (loading) return (
      <div className="p-12 space-y-8 animate-pulse">
        <div className="h-10 bg-white rounded-xl w-1/4"></div>
        <div className="h-[600px] bg-white rounded-2xl shadow-sm border border-zinc-100"></div>
      </div>
    );

    if (!quote) return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-black text-catyellow uppercase font-heading bg-catblack px-4 py-2 inline-block">Document Not Found</h2>
        <Link to="/quotes" className="mt-4 block text-xs font-bold text-zinc-500 hover:text-catblack uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4 mr-2 inline" /> Return to Ledger
        </Link>
      </div>
    );

    const subtotal = quote.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalWeight = quote.items.reduce((acc, item) => acc + (item.unit_weight * item.quantity), 0);
    const logistics = totalWeight * (quote.logistics_rate || 0.85);
    const total = subtotal + logistics;

    return (
      <div className="space-y-6 max-w-5xl mx-auto py-8">
        <div className="flex justify-between items-center print:hidden">
          <Link to="/quotes" className="flex items-center text-[10px] font-black text-zinc-500 hover:text-catblack uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matrix
          </Link>
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="inline-flex items-center px-6 py-2.5 bg-catblack text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-catyellow hover:text-catblack transition-all shadow-xl">
              <Printer className="w-3.5 h-3.5 mr-2" />
              Print Verification
            </button>
          </div>
        </div>

        <div className="bg-white p-16 shadow-2xl rounded-2xl border border-zinc-200 relative overflow-hidden" id="invoice-paper">
          <div className="absolute top-0 right-0 w-64 h-64 bg-catyellow/10 rounded-bl-[200px] -mr-32 -mt-32 -z-10"></div>
          
          <div className="flex justify-between items-start pb-12 border-b-2 border-catblack">
            <div className="flex items-center gap-5">
              <div className="bg-catblack p-3 rounded-xl shadow-xl shadow-catyellow/20 transform -rotate-3 border-2 border-catyellow">
                <Hammer className="text-catyellow w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-catblack uppercase tracking-tight font-heading leading-tight">American Iron LLC</h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] font-black text-catyellow bg-catblack px-2 py-0.5 uppercase tracking-widest">Heavy Logistics Core</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-200"></span>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <Globe className="w-3 h-3" /> US-OH-MATRIX-A1
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-5xl font-black text-catblack uppercase font-heading tracking-widest absolute right-16 top-16 opacity-5 select-none">DOCUMENT</h2>
              <div className="space-y-1 mt-2">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Quotation Identity</p>
                <p className="text-xl font-black text-catblack tracking-tighter">{quote.id}</p>
                <p className="text-[10px] font-bold text-catblack uppercase tracking-widest bg-catyellow px-2 py-1 rounded inline-block mt-2">
                  Status: {quote.status}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-20 mt-16">
            <div>
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-3 mb-4">Billing Registry</h3>
              <p className="text-sm font-black text-catblack uppercase tracking-tight mb-2">{quote.bill_to.name}</p>
              <div className="text-xs text-zinc-500 space-y-1 font-medium leading-relaxed uppercase tracking-tighter">
                {quote.bill_to.address.map((line, i) => <p key={i}>{line}</p>)}
                <p className="pt-2 text-[10px] font-black text-zinc-400">CONTACT: {quote.bill_to.phone}</p>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-3 mb-4">Logistics Destination</h3>
              <p className="text-sm font-black text-catblack uppercase tracking-tight mb-2">{quote.ship_to.name}</p>
              <div className="text-xs text-zinc-500 space-y-1 font-medium leading-relaxed uppercase tracking-tighter">
                {quote.ship_to.address.map((line, i) => <p key={i}>{line}</p>)}
                <p className="pt-2 text-[10px] font-black text-zinc-400">CONTACT: {quote.ship_to.phone}</p>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-catblack">
                  <th className="text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest py-4">#</th>
                  <th className="text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest py-4 px-4">Matrix ID</th>
                  <th className="text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest py-4 px-4 w-1/2">Manifest Description</th>
                  <th className="text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest py-4 px-4">Qty</th>
                  <th className="text-right text-[10px] font-black text-zinc-400 uppercase tracking-widest py-4 pl-4">Net Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {quote.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-6 text-[10px] font-black text-zinc-400">{String(index + 1).padStart(2, '0')}</td>
                    <td className="py-6 px-4 text-xs font-black text-catblack tracking-tighter uppercase">{item.part_number}</td>
                    <td className="py-6 px-4 text-xs font-bold text-zinc-600 leading-normal uppercase tracking-tighter">{item.description}</td>
                    <td className="py-6 px-4 text-center text-xs font-black text-catblack">{item.quantity}</td>
                    <td className="py-6 pl-4 text-right text-xs font-black text-catblack tracking-tighter">${(item.quantity * item.price).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-16 pt-8 border-t-4 border-catblack flex justify-end">
            <div className="w-80 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <span>Manifest Subtotal</span>
                <span className="text-catblack font-black">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <span>Weight ({totalWeight.toFixed(1)} LBS)</span>
                <span className="text-catblack font-black">${logistics.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                <span className="text-sm font-black text-catblack uppercase tracking-tight">Total Obligation</span>
                <span className="text-2xl font-black text-catyellow bg-catblack px-3 py-1 tracking-tighter">${total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-12 border-t border-zinc-100 flex justify-between items-end">
             <div className="space-y-4 max-w-lg">
                <div className="flex items-center gap-2 text-[10px] font-black text-catblack uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-catyellow fill-catblack" /> SECURE DOCUMENT VERIFICATION ACTIVE
                </div>
                <p className="text-[9px] text-zinc-400 font-bold uppercase leading-relaxed tracking-tighter">
                  This document serves as an official commercial quotation from American Iron LLC. 
                  Subject to standard logistics terms and inventory verification. Valid for 30 cycles from registration.
                </p>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-black text-catblack uppercase tracking-widest mb-1">Generated By Matrix Node</p>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">HUB-TERMINAL-V4.0-PRO</p>
             </div>
          </div>
        </div>
      </div>
    );
};

export default QuoteDetail;