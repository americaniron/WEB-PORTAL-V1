import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, Package, LogOut, Menu, X, Hammer, 
  Briefcase, Building, Zap, Activity, BrainCircuit, Search, Loader2,
  ChevronRight, Bell, AlertCircle, Database
} from 'lucide-react';
import { User, SystemHealth } from '../types';
import { api } from '../services/api';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Leads Hub', href: '/leads', icon: Users },
    { name: 'Global Accounts', href: '/customers', icon: Building },
    { name: 'Quote Matrix', href: '/quotes', icon: FileText },
    { name: 'Logistics Control', href: '/projects', icon: Briefcase },
    { name: 'Stockpile', href: '/inventory', icon: Package },
    { name: 'Data Intake', href: '/data-intake', icon: Database },
  ];

  useEffect(() => {
    const checkHealth = async () => {
      const status = await api.health.check();
      setHealth(status);
    };
    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  const runIntelligence = async () => {
    setAnalyzing(true);
    setIsAISidebarOpen(true);
    const result = await api.ai.analyze(`Path: ${location.pathname}. Access: ${user.role}. System: Production.`);
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans overflow-hidden">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-catblack/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-catblack border-r border-zinc-800 flex flex-col transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between h-20 px-8 border-b border-catyellow/20">
          <div className="flex items-center gap-4">
            <div className="bg-catyellow p-2.5 rounded-lg shadow-xl shadow-catyellow/20 transform -rotate-3">
              <Hammer className="text-catblack w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white uppercase tracking-tight font-heading leading-none">IRON HUB</span>
              <span className="text-[10px] font-bold text-catyellow uppercase tracking-widest leading-none mt-1.5 opacity-80">Industrial Portal</span>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-zinc-400 hover:text-white p-2"><X size={24} /></button>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.href} 
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `flex items-center justify-between px-5 py-3.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all group ${isActive ? 'bg-catyellow text-catblack shadow-2xl shadow-catyellow/30' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}
            >
              <div className="flex items-center">
                <item.icon className={`w-4 h-4 mr-4 transition-transform group-hover:scale-110`} />
                {item.name}
              </div>
              <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1`} />
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-zinc-900 bg-catblack/50">
           {health && (
             <div className="mb-6 px-4 py-3 bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${health.status === 'operational' ? 'bg-emerald-50 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></div>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Operational</span>
                </div>
                <span className="text-[10px] text-zinc-600 font-mono font-bold tracking-tighter">{health.latency}ms</span>
             </div>
           )}
           <button onClick={onLogout} className="flex w-full items-center justify-center px-4 py-3 text-[11px] font-black text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 rounded-xl border border-zinc-800 transition-all uppercase tracking-widest group">
             <LogOut className="w-3.5 h-3.5 mr-3 group-hover:-translate-x-1 transition-transform" />
             Exit Terminal
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden h-screen">
        <header className="h-20 bg-white border-b border-zinc-200 px-10 flex items-center justify-between shadow-sm z-30 shrink-0">
           <div className="flex items-center gap-6">
             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg">
               <Menu size={24} />
             </button>
             <div className="hidden md:flex items-center bg-zinc-100 rounded-full px-6 py-2.5 w-[420px] border border-zinc-200 focus-within:border-catyellow/50 focus-within:bg-white transition-all shadow-inner">
               <Search className="w-4 h-4 text-zinc-400 mr-3" />
               <input type="text" placeholder="Scan global ledger matrix..." className="bg-transparent border-none text-[11px] font-bold uppercase tracking-widest focus:ring-0 w-full placeholder:text-zinc-400" />
             </div>
           </div>

           <div className="flex items-center gap-8">
              <button 
                onClick={runIntelligence} 
                className="relative flex items-center px-6 py-2.5 bg-catblack text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-catyellow hover:text-catblack transition-all shadow-xl group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-catyellow/0 via-white/10 to-catyellow/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <BrainCircuit className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" />
                Intelligence Node
              </button>
              
              <div className="flex items-center gap-6 pl-8 border-l border-zinc-200">
                <button className="relative p-2 text-zinc-400 hover:text-catblack transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-catyellow rounded-full border-2 border-white"></span>
                </button>
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-catblack uppercase tracking-tighter leading-none">{user.email.split('@')[0]}</p>
                    <p className="text-[10px] text-catyellow font-black uppercase tracking-widest mt-1 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">{user.role}</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-catblack border-2 border-catblack flex items-center justify-center text-white text-sm font-black shadow-lg group-hover:bg-catyellow group-hover:text-catblack transition-colors">
                    {user.email[0].toUpperCase()}
                  </div>
                </div>
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 bg-[#f8f9fa] custom-scrollbar">
          <Outlet />
        </main>

        {/* AI Intelligence Drawer */}
        <div className={`fixed inset-y-0 right-0 w-[420px] bg-white shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.3)] z-50 transform transition-all duration-500 ease-out border-l border-zinc-200 ${isAISidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <div className="p-10 h-full flex flex-col bg-zinc-50/30 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-catyellow rounded-lg">
                    <Zap className="w-5 h-5 text-catblack fill-catblack" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-catblack font-heading">AI Cognitive Engine</h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Version 3.4.0 Production</p>
                  </div>
                </div>
                <button onClick={() => setIsAISidebarOpen(false)} className="p-2 hover:bg-zinc-200 rounded-lg transition-colors"><X className="w-5 h-5 text-zinc-400" /></button>
              </div>
              
              <div className="flex-1 space-y-8 overflow-y-auto pr-4 custom-scrollbar">
                 {analyzing ? (
                   <div className="flex flex-col items-center justify-center h-64 space-y-6">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-catyellow/20 border-t-catyellow rounded-full animate-spin"></div>
                        <BrainCircuit className="absolute inset-0 m-auto w-6 h-6 text-catyellow animate-pulse" />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 animate-pulse">Scanning Neural Datasets...</p>
                   </div>
                 ) : (
                   <div className="bg-white rounded-2xl p-7 border border-zinc-200 shadow-sm leading-relaxed text-zinc-700 text-sm space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-catyellow text-catblack text-[9px] font-black uppercase tracking-widest rounded">Context Decoded</span>
                      </div>
                      <p className="text-[13px] font-medium leading-relaxed whitespace-pre-wrap">
                        {aiAnalysis || "Cognitive engine idle. Deploy analysis from the command hub to review operational data clusters."}
                      </p>
                   </div>
                 )}
                 
                 <div className="p-6 bg-catblack rounded-2xl border border-zinc-800 text-white shadow-xl">
                   <h4 className="text-[11px] font-black text-catyellow uppercase tracking-widest mb-3 flex items-center gap-2">
                     <AlertCircle className="w-3.5 h-3.5" />
                     Tactical Recommendation
                   </h4>
                   <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                     Neural patterns suggest a 15% increase in logistics demand for the Q3 pipeline. Review stockpile levels in the 'Stockpile' matrix to preempt supply-chain bottlenecks.
                   </p>
                 </div>
              </div>

              <div className="mt-auto pt-8 border-t border-zinc-200 flex items-center justify-between">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   Gemini 3.0 Real-time Core
                </span>
                <span className="text-[10px] font-bold text-zinc-300">HUB-AI-ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
              </div>
           </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default Layout;