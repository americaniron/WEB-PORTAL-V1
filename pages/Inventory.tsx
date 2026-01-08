import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { InventoryItem } from '../types';
import { Package, Search, Wrench, Truck } from 'lucide-react';

const Inventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'equipment' | 'part'>('equipment');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await api.inventory.getAll();
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch inventory");
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const filteredItems = items.filter(item => item.type === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900 uppercase font-heading">Inventory</h1>
        <div className="flex bg-slate-200 p-1 rounded">
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-4 py-2 rounded text-sm font-bold uppercase tracking-wide transition-all ${
              activeTab === 'equipment' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Equipment
          </button>
          <button
            onClick={() => setActiveTab('part')}
            className={`px-4 py-2 rounded text-sm font-bold uppercase tracking-wide transition-all ${
              activeTab === 'part' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Parts
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 border-b border-slate-200 sm:px-6 flex justify-between items-center bg-slate-50">
            <h3 className="text-lg leading-6 font-bold text-slate-900 font-heading uppercase">
              {activeTab === 'equipment' ? 'Heavy Equipment List' : 'Spare Parts List'}
            </h3>
            <div className="relative">
               <input 
                  type="text" 
                  placeholder="Search inventory..." 
                  className="border border-slate-300 rounded-md py-1 px-3 text-sm focus:ring-red-500 focus:border-red-500 w-64"
               />
               <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2" />
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider font-heading">
                  Item Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider font-heading">
                  Identifiers
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider font-heading">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider font-heading">
                  Value
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                // Skeleton Rows
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-slate-200 rounded"></div>
                        <div className="ml-4 space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-32"></div>
                          <div className="h-3 bg-slate-100 rounded w-24"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-24"></div>
                      <div className="h-3 bg-slate-100 rounded w-28"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-5 bg-slate-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-slate-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded bg-slate-800 flex items-center justify-center">
                          {item.type === 'equipment' ? <Truck className="h-5 w-5 text-white" /> : <Wrench className="h-5 w-5 text-white" />}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">{item.name}</div>
                          <div className="text-sm text-slate-500">{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.model_number && <div className="text-sm text-slate-900"><span className="font-semibold text-slate-500 text-xs uppercase">Model:</span> {item.model_number}</div>}
                      {item.serial_number && <div className="text-sm text-slate-900"><span className="font-semibold text-slate-500 text-xs uppercase">SN:</span> {item.serial_number}</div>}
                      {item.part_number && <div className="text-sm text-slate-900"><span className="font-semibold text-slate-500 text-xs uppercase">PN:</span> {item.part_number}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                        item.quantity > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.quantity} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      ${(item.price || item.cost || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-red-700 hover:text-red-900 font-bold uppercase tracking-wide text-xs">Edit</button>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filteredItems.length === 0 && (
                 <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">
                       No items found.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;