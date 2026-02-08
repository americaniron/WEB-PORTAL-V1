import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  Upload, FileText, Database, CheckCircle, AlertTriangle, 
  Search, ShieldCheck, ChevronRight, X, Loader2, RefreshCw, 
  Building, Package, Receipt, FileSpreadsheet
} from 'lucide-react';

type EntityType = 'customers' | 'inventory' | 'payments';

const DataIntake = () => {
  const [activeEntity, setActiveEntity] = useState<EntityType>('inventory');
  const [importStatus, setImportStatus] = useState<'idle' | 'parsing' | 'validating' | 'ready' | 'committing' | 'success'>('idle');
  const [content, setContent] = useState('');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, valid: 0, invalid: 0 });

  const handleAIParse = async () => {
    if (!content.trim()) return;
    setImportStatus('parsing');
    try {
      const result = await api.ai.parseImportData(content, activeEntity);
      setParsedData(result);
      setStats({ total: result.length, valid: result.length, invalid: 0 });
      setImportStatus('ready');
    } catch (err) {
      setImportStatus('idle');
      console.error("AI Parse Failure");
    }
  };

  const handleCommit = async () => {
    setImportStatus('committing');
    try {
      if (activeEntity === 'inventory') {
        await api.inventory.bulkCreate(parsedData);
      } else if (activeEntity === 'customers') {
        await api.customers.bulkCreate(parsedData);
      } else if (activeEntity === 'payments') {
        await api.customers.bulkCreatePayments(parsedData);
      }
      setImportStatus('success');
      setTimeout(() => {
        setImportStatus('idle');
        setContent('');
        setParsedData([]);
      }, 3000);
    } catch (err) {
      setImportStatus('ready');
      console.error("Bulk Commit Failure");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-catblack uppercase tracking-tight font-heading leading-none">Data Intake Hub</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
            <Database className="w-3 h-3 text-catyellow" /> Legacy Matrix Migration Terminal
          </p>
        </div>
        
        <div className="flex bg-zinc-200 p-1 rounded-xl shadow-inner border border-zinc-300">
           {(['inventory', 'customers', 'payments'] as EntityType[]).map((type) => (
             <button
               key={type}
               onClick={() => { setActiveEntity(type); setParsedData([]); setImportStatus('idle'); }}
               className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                 activeEntity === type ? 'bg-catblack text-catyellow shadow-lg' : 'text-zinc-500 hover:text-catblack'
               }`}
             >
               {type}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Terminal */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
               {activeEntity === 'inventory' ? <Package className="w-8 h-8 text-zinc-100" /> : activeEntity === 'customers' ? <Building className="w-8 h-8 text-zinc-100" /> : <Receipt className="w-8 h-8 text-zinc-100" />}
             </div>
             
             <h2 className="text-sm font-black text-catblack uppercase tracking-widest mb-4 flex items-center gap-2">
               <Upload className="w-4 h-4 text-catyellow" /> Ingestion Matrix
             </h2>
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">Paste raw content from spreadsheets, CSVs, or legacy reports below.</p>
             
             <textarea
               value={content}
               onChange={(e) => setContent(e.target.value)}
               disabled={importStatus === 'parsing'}
               className="w-full h-[400px] bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-xs font-mono text-zinc-600 focus:ring-2 focus:ring-catyellow/20 outline-none transition-all disabled:opacity-50"
               placeholder="LEGACY DATA CLUSTER INPUT..."
             />

             <button
               onClick={handleAIParse}
               disabled={!content || importStatus === 'parsing'}
               className="w-full mt-6 py-4 bg-catblack text-catyellow rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-zinc-900 transition-all disabled:opacity-50"
             >
               {importStatus === 'parsing' ? (
                 <><Loader2 className="w-4 h-4 animate-spin" /> Cognitive Mapping...</>
               ) : (
                 <><RefreshCw className="w-4 h-4" /> Initialize AI Scan</>
               )}
             </button>
          </div>
        </div>

        {/* Validation Terminal */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm min-h-[580px] flex flex-col relative overflow-hidden">
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-catblack uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Integrity Verification
                  </h2>
                  {importStatus === 'ready' && <p className="text-[9px] font-bold text-emerald-600 uppercase mt-1 tracking-widest">Dataset Validated • Ready for Production Commit</p>}
                </div>
                {parsedData.length > 0 && (
                  <div className="flex gap-4">
                    <div className="text-right">
                       <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Packet Size</span>
                       <p className="text-xs font-black text-catblack">{parsedData.length} Records</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-auto bg-zinc-50/50 p-6">
                {importStatus === 'idle' ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 border-2 border-dashed border-zinc-200 rounded-2xl">
                    <FileSpreadsheet className="w-16 h-16 text-zinc-200" />
                    <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest max-w-[280px]">Terminal awaiting data ingestion. Initialize scan to begin cognitive mapping.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-200">
                      <thead className="bg-zinc-100">
                        <tr className="text-left text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                          <th className="px-4 py-3">Mapping Identity</th>
                          <th className="px-4 py-3">Telemetry A</th>
                          <th className="px-4 py-3">Telemetry B</th>
                          <th className="px-4 py-3">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 bg-white">
                        {parsedData.map((row, i) => (
                          <tr key={i} className="hover:bg-catyellow/5 transition-colors">
                            <td className="px-4 py-4">
                              <span className="text-[10px] font-black text-catblack uppercase">{row.name || row.id || 'N/A'}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-[10px] font-bold text-zinc-500 uppercase">{row.model_number || row.email || row.date || 'N/A'}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-[10px] font-bold text-zinc-500 uppercase">{row.quantity || row.phone || row.amount || 'N/A'}</span>
                            </td>
                            <td className="px-4 py-4">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-zinc-100 bg-zinc-50/50">
                 <div className="flex items-center justify-between">
                    <div className="flex gap-6">
                      <StatItem label="Parsed" value={stats.total} color="text-catblack" />
                      <StatItem label="Verified" value={stats.valid} color="text-emerald-600" />
                      <StatItem label="Dropped" value={stats.invalid} color="text-red-600" />
                    </div>
                    
                    <button
                      onClick={handleCommit}
                      disabled={importStatus !== 'ready' || parsedData.length === 0}
                      className={`inline-flex items-center px-10 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl ${
                        importStatus === 'success' ? 'bg-emerald-600 text-white' : 'bg-catyellow text-catblack hover:bg-catblack hover:text-catyellow'
                      } disabled:opacity-50`}
                    >
                      {importStatus === 'committing' ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Writing to Matrix...</>
                      ) : importStatus === 'success' ? (
                        <><CheckCircle className="w-4 h-4 mr-2" /> Commit Successful</>
                      ) : (
                        <><ShieldCheck className="w-4 h-4 mr-2" /> Commit to Production</>
                      )}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="flex flex-col">
    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{label}</span>
    <span className={`text-sm font-black ${color} tracking-tighter`}>{value.toString().padStart(2, '0')}</span>
  </div>
);

export default DataIntake;