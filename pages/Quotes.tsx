import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Quote } from '../types';
import { Plus, FileText, Send, Trash2 } from 'lucide-react';

const Quotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [items, setItems] = useState([{ description: '', quantity: 1, price: 0 }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const data = await api.quotes.getAll();
        setQuotes(data);
      } catch (err) {
        console.error("Failed to fetch quotes");
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    setItems(items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newQuote = await api.quotes.create({
        client_name: clientName,
        client_email: clientEmail,
        quote_details: { items },
        status: 'draft'
      });
      setQuotes([newQuote, ...quotes]);
      setShowForm(false);
      // Reset form
      setClientName('');
      setClientEmail('');
      setItems([{ description: '', quantity: 1, price: 0 }]);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotal = (quote: Quote) => {
    return quote.quote_details.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 uppercase font-heading">Quotes</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded shadow-sm text-sm font-bold text-white bg-red-700 hover:bg-red-800 transition-colors uppercase tracking-wider"
        >
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> New Quote</>}
        </button>
      </div>

      {/* Create Quote Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-red-700">
          <h2 className="text-xl font-bold text-slate-900 mb-4 font-heading uppercase">Create New Quote</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Client Name</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Client Email</label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-3 uppercase">Items</label>
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 mb-3 items-end">
                  <div className="flex-grow">
                    <input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 sm:text-sm focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      className="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 sm:text-sm focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      placeholder="Price"
                      min="0"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                      className="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 sm:text-sm focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddItem} className="mt-2 text-sm text-red-700 hover:text-red-900 font-bold uppercase tracking-wide">
                + Add Item
              </button>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
               <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center px-6 py-2 border border-transparent rounded shadow-sm text-sm font-bold text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 uppercase tracking-wider transition-colors"
              >
                {submitting ? 'Creating...' : 'Generate Quote'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quote List */}
      <div className="bg-white shadow-sm border border-slate-200 overflow-hidden sm:rounded-lg">
        {loading ? (
           <div className="divide-y divide-slate-200 animate-pulse">
             {[...Array(3)].map((_, i) => (
               <div key={i} className="p-6 flex justify-between items-center">
                 <div className="flex items-center w-1/2">
                   <div className="h-12 w-12 bg-slate-200 rounded"></div>
                   <div className="ml-4 space-y-2 w-full">
                     <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                     <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                   </div>
                 </div>
                 <div className="w-1/4 space-y-2 flex flex-col items-end">
                    <div className="h-7 bg-slate-200 rounded w-24"></div>
                    <div className="h-5 bg-slate-200 rounded w-16"></div>
                 </div>
               </div>
             ))}
           </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {quotes.map((quote) => (
              <li key={quote.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-slate-800 rounded p-3">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-slate-900 font-heading">{quote.client_name}</h3>
                      <p className="text-sm text-slate-500">{quote.client_email}</p>
                      <p className="text-xs text-slate-400 mt-1">ID: #{quote.id} • Created {new Date(quote.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900 font-heading">${calculateTotal(quote).toLocaleString()}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide
                        ${quote.status === 'sent' ? 'bg-blue-100 text-blue-800' : 
                          quote.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                          'bg-slate-100 text-slate-800'}`}>
                        {quote.status}
                      </span>
                    </div>
                    <button className="text-slate-400 hover:text-red-700 transition-colors">
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {/* Simple Details Preview */}
                <div className="mt-4 pl-16 border-l-2 border-slate-100 ml-4">
                   <p className="text-sm text-slate-600 italic">
                     Includes: {quote.quote_details.items.map(i => i.description).join(', ')}
                   </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Quotes;