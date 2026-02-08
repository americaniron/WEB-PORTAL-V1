import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Customer, Quote, Payment, AuditLog, RecurringInvoice, User } from '../types';
import { 
  ArrowLeft, Edit, DollarSign, Receipt, CreditCard, Save, X, Search, 
  RotateCcw, Mail, Loader2, Check, Plus, Calendar, Landmark, Repeat, 
  PlayCircle, History, User as UserIcon, ShieldCheck, TrendingUp,
  Phone, ArrowUpRight, ArrowDownRight, Hash
} from 'lucide-react';

const CustomerDetail = () => {
    const { id } = useParams();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ledger' | 'receipts' | 'audit'>('ledger');
    
    // Editing state
    const [isEditing, setIsEditing] = useState(false);
    const [editableCustomer, setEditableCustomer] = useState<Customer | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Payment Form State
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentData, setPaymentData] = useState<Omit<Payment, 'id' | 'customer_id'>>({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      method: 'Bank Transfer',
      invoice_id: ''
    });

    const fetchData = async () => {
        if (id) {
            setLoading(true);
            try {
                const data = await api.customers.getById(Number(id));
                setCustomer(data.customer);
                setEditableCustomer(data.customer);
                setQuotes(data.quotes);
                setPayments(data.payments);
                setLogs(data.logs);
            } catch (error) {
                console.error("Account reconciliation failure", error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleAddPayment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!customer || !paymentData.amount) return;
      setSubmitting(true);
      try {
        await api.customers.createPayment({
          ...paymentData,
          customer_id: customer.id,
          invoice_id: paymentData.invoice_id || undefined
        });
        setShowPaymentForm(false);
        setPaymentData({
          date: new Date().toISOString().split('T')[0],
          amount: 0,
          method: 'Bank Transfer',
          invoice_id: ''
        });
        await fetchData(); // Refresh all data
      } catch (err) {
        console.error("Payment allocation failed");
      } finally {
        setSubmitting(false);
      }
    };

    if (loading) return (
      <div className="p-12 space-y-8 animate-pulse">
        <div className="h-20 bg-white rounded-2xl w-full"></div>
        <div className="grid grid-cols-3 gap-8">
          <div className="h-40 bg-white rounded-2xl"></div>
          <div className="h-40 bg-white rounded-2xl"></div>
          <div className="h-40 bg-white rounded-2xl"></div>
        </div>
        <div className="h-96 bg-white rounded-2xl"></div>
      </div>
    );

    if (!customer) return <div className="p-20 text-center font-black uppercase text-catyellow bg-catblack inline-block">Profile Not Found</div>;

    const balance = (customer.total_billed || 0) - (customer.total_paid || 0);

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
            <Link to="/customers" className="inline-flex items-center text-[10px] font-black text-zinc-500 hover:text-catblack transition-all uppercase tracking-widest group">
                <ArrowLeft className="w-3.5 h-3.5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Account Matrix
            </Link>

            {/* Profile Header */}
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-zinc-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-catyellow/10 rounded-bl-full -mr-16 -mt-16"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-catblack flex items-center justify-center text-catyellow shadow-2xl shadow-catblack/20 border-b-4 border-catyellow">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <div>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editableCustomer?.name} 
                        onChange={(e) => setEditableCustomer({...editableCustomer!, name: e.target.value})}
                        className="text-4xl font-black text-catblack uppercase tracking-tight font-heading border-b-2 border-catyellow outline-none w-full bg-zinc-50 px-2"
                      />
                    ) : (
                      <h1 className="text-4xl font-black text-catblack uppercase tracking-tight font-heading leading-none">{customer.name}</h1>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                       <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                         <Mail className="w-3 h-3 text-catyellow" /> {customer.email}
                       </p>
                       <span className="w-1 h-1 rounded-full bg-zinc-200"></span>
                       <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                         <Phone className="w-3 h-3 text-catyellow" /> {customer.phone}
                       </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 relative z-10">
                  {isEditing ? (
                    <>
                      <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 border border-zinc-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-zinc-600 bg-white hover:bg-zinc-50">Cancel</button>
                      <button onClick={() => { setIsEditing(false); setCustomer(editableCustomer); fetchData(); }} className="px-6 py-2.5 bg-catblack text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg">Commit Changes</button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="inline-flex items-center px-6 py-2.5 border border-zinc-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-zinc-600 bg-white hover:bg-zinc-50 transition-all shadow-sm">
                      <Edit className="w-3.5 h-3.5 mr-2" /> Adjust Profile
                    </button>
                  )}
                </div>
            </div>

            {/* Financial Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <SummaryCard label="Aggregate Billing" value={`$${(customer.total_billed || 0).toLocaleString()}`} icon={DollarSign} color="text-catblack" bg="bg-catyellow" />
               <SummaryCard label="Confirmed Receipts" value={`$${(customer.total_paid || 0).toLocaleString()}`} icon={Receipt} color="text-emerald-700" bg="bg-white" />
               <SummaryCard label="Current Exposure" value={`$${balance.toLocaleString()}`} icon={CreditCard} color={balance > 0 ? "text-amber-600" : "text-zinc-400"} bg="bg-white" />
            </div>

            {/* Account Management Workspace */}
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="px-8 border-b border-zinc-100 flex items-center justify-between h-20">
                   <nav className="flex gap-10 h-full">
                     <TabButton label="Operations Ledger" active={activeTab === 'ledger'} onClick={() => setActiveTab('ledger')} />
                     <TabButton label="Receipt Journal" active={activeTab === 'receipts'} onClick={() => setActiveTab('receipts')} />
                     <TabButton label="Audit Stream" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
                   </nav>
                   {activeTab === 'receipts' && (
                     <button 
                       onClick={() => setShowPaymentForm(!showPaymentForm)}
                       className="inline-flex items-center px-5 py-2 rounded-xl bg-catblack text-catyellow text-[10px] font-black uppercase tracking-widest hover:bg-catyellow hover:text-catblack transition-all shadow-xl"
                     >
                       {showPaymentForm ? <X className="w-3.5 h-3.5 mr-2" /> : <Plus className="w-3.5 h-3.5 mr-2" />}
                       {showPaymentForm ? 'Cancel Entry' : 'Log New Receipt'}
                     </button>
                   )}
                </div>

                <div className="overflow-x-auto">
                   {activeTab === 'ledger' && (
                     <table className="min-w-full divide-y divide-zinc-100">
                        <thead className="bg-zinc-50">
                          <tr className="text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Document ID</th>
                            <th className="px-8 py-5 text-center">Reference Date</th>
                            <th className="px-8 py-5 text-center">Gross Valuation</th>
                            <th className="px-8 py-5 text-center">Status Matrix</th>
                            <th className="px-8 py-5 text-right">Verification</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                          {quotes.length > 0 ? quotes.map(q => (
                            <tr key={q.id} className="hover:bg-zinc-50 transition-all group">
                              <td className="px-8 py-6">
                                <span className="text-sm font-black text-catblack uppercase tracking-tight group-hover:text-catyellow">{q.id}</span>
                              </td>
                              <td className="px-8 py-6 text-center text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                                {new Date(q.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-8 py-6 text-center text-sm font-black text-catblack tracking-tighter">
                                ${q.quote_details.items.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString()}
                              </td>
                              <td className="px-8 py-6 text-center">
                                <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                  q.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                                }`}>
                                  {q.status}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <Link to={`/quotes/${q.id}`} className="p-2.5 rounded-xl bg-zinc-100 text-zinc-400 hover:bg-catblack hover:text-catyellow transition-all inline-block">
                                  <ArrowUpRight className="w-4 h-4" />
                                </Link>
                              </td>
                            </tr>
                          )) : (
                            <tr><td colSpan={5} className="p-20 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">No matching document clusters</td></tr>
                          )}
                        </tbody>
                     </table>
                   )}

                   {activeTab === 'receipts' && (
                      <div className="flex flex-col">
                        {showPaymentForm && (
                          <div className="p-8 bg-zinc-50 border-b border-zinc-100 animate-in slide-in-from-top-4 duration-300">
                             <h4 className="text-[11px] font-black text-catblack uppercase tracking-widest mb-6 flex items-center gap-2">
                               <Plus className="w-3.5 h-3.5 text-catyellow" /> Payment Entry Protocol
                             </h4>
                             <form onSubmit={handleAddPayment} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                               <div className="space-y-1.5">
                                 <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Receipt Date</label>
                                 <input 
                                   type="date" 
                                   required 
                                   value={paymentData.date}
                                   onChange={e => setPaymentData({...paymentData, date: e.target.value})}
                                   className="block w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-catyellow/20 focus:border-catyellow" 
                                 />
                               </div>
                               <div className="space-y-1.5">
                                 <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Transfer Amount ($)</label>
                                 <input 
                                   type="number" 
                                   required 
                                   min="0.01" 
                                   step="0.01"
                                   value={paymentData.amount}
                                   onChange={e => setPaymentData({...paymentData, amount: Number(e.target.value)})}
                                   className="block w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-catyellow/20 focus:border-catyellow" 
                                 />
                               </div>
                               <div className="space-y-1.5">
                                 <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Payment Methodology</label>
                                 <select 
                                   value={paymentData.method}
                                   onChange={e => setPaymentData({...paymentData, method: e.target.value as any})}
                                   className="block w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-catyellow/20 focus:border-catyellow"
                                 >
                                   <option value="Bank Transfer">Bank Transfer</option>
                                   <option value="Credit Card">Credit Card</option>
                                   <option value="Check">Check</option>
                                 </select>
                               </div>
                               <div className="space-y-1.5">
                                 <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Allocated Document (Optional)</label>
                                 <select 
                                   value={paymentData.invoice_id}
                                   onChange={e => setPaymentData({...paymentData, invoice_id: e.target.value})}
                                   className="block w-full bg-white border border-zinc-200 rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-catyellow/20 focus:border-catyellow"
                                 >
                                   <option value="">Unallocated Funds</option>
                                   {quotes.map(q => <option key={q.id} value={q.id}>{q.id} (${q.quote_details.items.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString()})</option>)}
                                 </select>
                               </div>
                               <div className="md:col-span-4 flex justify-end">
                                 <button 
                                   type="submit" 
                                   disabled={submitting}
                                   className="inline-flex items-center px-8 py-3 bg-catyellow text-catblack rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-catyellow/20 hover:bg-[#E6B800] transition-all"
                                 >
                                   {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                   Finalize Record
                                 </button>
                               </div>
                             </form>
                          </div>
                        )}

                        <table className="min-w-full divide-y divide-zinc-100">
                          <thead className="bg-zinc-50">
                            <tr className="text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                              <th className="px-8 py-5">Receipt ID</th>
                              <th className="px-8 py-5 text-center">Entry Date</th>
                              <th className="px-8 py-5 text-center">Net Amount</th>
                              <th className="px-8 py-5 text-center">Methodology</th>
                              <th className="px-8 py-5 text-right">Associated Doc</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-50 bg-white">
                            {payments.length > 0 ? payments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => (
                              <tr key={p.id} className="hover:bg-zinc-50 transition-all">
                                <td className="px-8 py-6">
                                  <span className="text-xs font-black text-catblack uppercase tracking-widest">{p.id}</span>
                                </td>
                                <td className="px-8 py-6 text-center text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                                  {new Date(p.date).toLocaleDateString()}
                                </td>
                                <td className="px-8 py-6 text-center text-sm font-black text-emerald-700 tracking-tighter">
                                  +${p.amount.toLocaleString()}
                                </td>
                                <td className="px-8 py-6 text-center">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-800 border border-zinc-200">
                                    {p.method === 'Bank Transfer' ? <Landmark className="w-3 h-3" /> : p.method === 'Credit Card' ? <CreditCard className="w-3 h-3" /> : <Receipt className="w-3 h-3" />}
                                    {p.method}
                                  </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                  {p.invoice_id ? (
                                    <Link to={`/quotes/${p.invoice_id}`} className="inline-flex items-center gap-1 text-[10px] font-black text-catblack uppercase tracking-widest hover:underline hover:text-catyellow">
                                      <Hash className="w-3 h-3 text-catyellow" /> {p.invoice_id}
                                    </Link>
                                  ) : (
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic">UNALLOCATED</span>
                                  )}
                                </td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={5} className="p-20 text-center">
                                  <DollarSign className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">No verified receipts found for this account.</p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                   )}

                   {activeTab === 'audit' && (
                     <table className="min-w-full divide-y divide-zinc-100">
                        <thead className="bg-zinc-50">
                          <tr className="text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Timestamp</th>
                            <th className="px-8 py-5">Responsible Party</th>
                            <th className="px-8 py-5">Action Matrix</th>
                            <th className="px-8 py-5">Telemetric Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                          {logs.map(log => (
                            <tr key={log.id}>
                              <td className="px-8 py-6 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-catblack tracking-tight">{new Date(log.created_at).toLocaleDateString()}</span>
                                  <span className="text-[9px] text-zinc-400 font-bold mt-1 uppercase tracking-widest">{new Date(log.created_at).toLocaleTimeString()}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 tracking-tight">
                                  <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                                  {log.user_email}
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <span className="inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-catblack text-catyellow">
                                  {log.action}
                                </span>
                              </td>
                              <td className="px-8 py-6">
                                <p className="text-xs text-zinc-500 leading-relaxed font-medium max-w-lg">{log.details}</p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                     </table>
                   )}
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ label, value, icon: Icon, color, bg }: any) => (
  <div className={`${bg} p-8 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between`}>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">{label}</p>
      <p className={`text-3xl font-black ${color} tracking-tighter font-heading`}>{value}</p>
    </div>
    <div className={`p-4 rounded-2xl ${bg === 'bg-white' ? 'bg-zinc-50' : 'bg-white/10'} ${color}`}>
      <Icon className="w-8 h-8" />
    </div>
  </div>
);

const TabButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`h-full px-2 border-b-2 font-black text-[11px] uppercase tracking-widest transition-all ${
      active ? 'border-catyellow text-catblack bg-catyellow/5' : 'border-transparent text-zinc-400 hover:text-catblack'
    }`}
  >
    {label}
  </button>
);

export default CustomerDetail;