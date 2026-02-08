import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { InventoryItem } from '../types';
import { Package, Search, Wrench, Truck, Plus, AlertTriangle, ChevronRight, Hash, DollarSign, Upload, Info, X, Loader2, Save } from 'lucide-react';

const Inventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'equipment' | 'part'>('equipment');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bulkCsv, setBulkCsv] = useState('');
  
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    type: activeTab,
    quantity: 1,
    model_number: '',
    serial_number: '',
    price: 0,
    part_number: '',
    cost: 0,
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await api.inventory.getAll();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' || name === 'cost' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.inventory.create({
        ...newItem,
        type: activeTab
      } as Omit<InventoryItem, 'id'>);
      setShowAddForm(false);
      setNewItem({
        name: '',
        description: '',
        type: activeTab,
        quantity: 1,
        model_number: '',
        serial_number: '',
        price: 0,
        part_number: '',
        cost: 0,
      });
      fetchInventory();
    } catch (error) {
      console.error("Failed to create item", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (!bulkCsv.trim()) return;
    setSubmitting(true);
    try {
      const lines = bulkCsv.split('\n');
      const itemsToCreate = lines.map(line => {
        const [name, model_number, quantity, price] = line.split(',').map(s => s.trim());
        return {
          name,
          model_number,
          quantity: Number(quantity) || 1,
          price: Number(price) || 0,
          description: `Bulk uploaded ${activeTab}`,
          type: activeTab,
          serial_number: 'AUTO-GEN'
        } as Omit<InventoryItem, 'id'>;
      }).filter(item => item.name);

      await api.inventory.bulkCreate(itemsToCreate);
      setBulkCsv('');
      setShowBulkUpload(false);
      fetchInventory();
    } catch (error) {
      console.error("Bulk upload failed", error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.type === activeTab && 
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-catblack uppercase tracking-tight font-heading leading-none">Stockpile Registry</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Industrial Inventory & Asset Tracking</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-zinc-200 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setActiveTab('equipment')}
              className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'equipment' ? 'bg-catblack text-catyellow shadow-md' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Heavy Equipment
            </button>
            <button
              onClick={() => setActiveTab('part')}
              className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'part' ? 'bg-catblack text-catyellow shadow-md' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              System Parts
            </button>
          </div>
          
          <button
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            className="inline-flex items-center px-4 py-2.5 border border-zinc-200 rounded-xl text-[11px] font-black text-zinc-600 bg-white hover:bg-zinc-50 transition-all uppercase tracking-widest shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 mr-2" />
            Bulk
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-6 py-2.5 rounded-xl shadow-lg shadow-catyellow/20 text-[11px] font-black text-catblack bg-catyellow hover:bg-[#E6B800] transition-all uppercase tracking-widest"
          >
            {showAddForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-3.5 h-3.5 mr-2" />}
            {showAddForm ? 'Close Form' : 'Manifest Item'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-zinc-200 animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-black text-catblack uppercase tracking-tight font-heading mb-6">Manifest New {activeTab}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Formal Name</label>
              <input name="name" required value={newItem.name} onChange={handleInputChange} className="block w-full bg-zinc-50 border-zinc-200 rounded-xl focus:ring-catyellow focus:border-catyellow text-xs font-bold uppercase tracking-widest py-3 px-4 border" placeholder="e.g. CAT D6T Dozer" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Model Reference</label>
              <input name="model_number" value={newItem.model_number} onChange={handleInputChange} className="block w-full bg-zinc-50 border-zinc-200 rounded-xl focus:ring-catyellow focus:border-catyellow text-xs font-bold uppercase tracking-widest py-3 px-4 border" placeholder="e.g. D6T-LGP" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Units in Stock</label>
              <input type="number" name="quantity" required min="1" value={newItem.quantity} onChange={handleInputChange} className="block w-full bg-zinc-50 border-zinc-200 rounded-xl focus:ring-catyellow focus:border-catyellow text-xs font-bold uppercase tracking-widest py-3 px-4 border" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Unit Price ($)</label>
              <input type="number" name="price" required min="0" value={newItem.price} onChange={handleInputChange} className="block w-full bg-zinc-50 border-zinc-200 rounded-xl focus:ring-catyellow focus:border-catyellow text-xs font-bold uppercase tracking-widest py-3 px-4 border" />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Manifest Description</label>
              <textarea name="description" required value={newItem.description} onChange={handleInputChange} className="block w-full bg-zinc-50 border-zinc-200 rounded-xl focus:ring-catyellow focus:border-catyellow text-xs font-bold uppercase tracking-widest py-3 px-4 border h-12" placeholder="Primary features and condition..." />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end pt-4">
              <button disabled={submitting} type="submit" className="inline-flex items-center px-8 py-3 rounded-xl shadow-lg shadow-catyellow/20 text-[11px] font-black text-catblack bg-catyellow hover:bg-[#E6B800] transition-all uppercase tracking-widest">
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Log into Registry
              </button>
            </div>
          </form>
        </div>
      )}

      {showBulkUpload && (
        <div className="bg-catblack p-8 rounded-2xl shadow-2xl border border-zinc-800 text-white animate-in slide-in-from-top-4 duration-300">
           <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight font-heading text-catyellow">Bulk Matrix Ingestion</h2>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Paste CSV data for rapid inventory logging</p>
              </div>
              <button onClick={() => setShowBulkUpload(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
           </div>
           
           <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-6 flex gap-3 items-start">
             <Info className="w-5 h-5 text-catyellow shrink-0" />
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
               Format: <span className="text-catyellow">Name, Model, Quantity, Price</span> per line.<br/>
               Example: CAT D11T, D11T-2024, 2, 850000
             </p>
           </div>

           <textarea 
             value={bulkCsv}
             onChange={(e) => setBulkCsv(e.target.value)}
             className="w-full h-48 bg-zinc-900 border-zinc-800 rounded-xl focus:ring-catyellow focus:border-catyellow text-xs font-mono p-4 text-emerald-500 outline-none" 
             placeholder="Equipment Name, Model ID, Qty, Unit Price"
           />
           
           <div className="flex justify-end mt-6">
             <button onClick={handleBulkSubmit} disabled={submitting || !bulkCsv.trim()} className="inline-flex items-center px-8 py-3 rounded-xl shadow-lg shadow-catyellow/20 text-[11px] font-black text-catblack bg-catyellow hover:bg-[#E6B800] disabled:opacity-50 transition-all uppercase tracking-widest">
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Execute Bulk Ingest
             </button>
           </div>
        </div>
      )}

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 bg-zinc-50 border-zinc-200 rounded-xl focus:ring-catyellow focus:border-catyellow transition-all text-xs font-bold uppercase tracking-widest py-3 border"
            placeholder={`Search ${activeTab} matrix...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white h-24 rounded-2xl border border-zinc-100 animate-pulse"></div>
          ))
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 hover:border-catyellow transition-all group flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-xl bg-catblack flex items-center justify-center text-white shadow-xl shadow-catblack/20 border-b-4 border-catyellow">
                  {item.type === 'equipment' ? <Truck className="w-8 h-8 text-catyellow" /> : <Wrench className="w-8 h-8 text-catyellow" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-catblack uppercase tracking-tight font-heading group-hover:text-catyellow transition-colors">{item.name}</h3>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="flex items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      <Hash className="w-3 h-3 mr-1" />
                      {item.model_number || item.part_number || 'N/A'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-zinc-200"></span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest max-w-[200px] truncate">{item.description}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-12">
                <div className="text-right">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Unit Valuation</p>
                  <p className="text-lg font-black text-catblack tracking-tighter font-heading">${(item.price || item.cost || 0).toLocaleString()}</p>
                </div>
                
                <div className="text-center min-w-[120px]">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Stock Level</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      item.quantity < 5 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {item.quantity} UNITS
                    </span>
                    {item.quantity < 5 && <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />}
                  </div>
                </div>

                <button className="p-3 rounded-xl bg-zinc-100 text-zinc-400 hover:bg-catblack hover:text-catyellow transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
        {!loading && filteredItems.length === 0 && (
          <div className="p-20 text-center bg-white rounded-2xl border border-zinc-200 border-dashed">
            <Package className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">No stock records match current filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;