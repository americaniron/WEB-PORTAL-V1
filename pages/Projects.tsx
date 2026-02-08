import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Project } from '../types';
import { Briefcase, Plus, TrendingUp, Calendar, ArrowRight, Activity } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const data = await api.projects.getAll();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-950 uppercase tracking-tight font-heading">Logistics Control</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Industrial Project Matrix & Budget Analysis</p>
        </div>
        <button className="inline-flex items-center px-6 py-2.5 rounded-xl shadow-lg shadow-red-900/20 text-[11px] font-black text-white bg-red-700 hover:bg-red-800 transition-all uppercase tracking-widest">
          <Plus className="w-3.5 h-3.5 mr-2" />
          Initiate Operation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-2xl border border-zinc-100 animate-pulse"></div>
          ))
        ) : projects.map((project) => (
          <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col group hover:border-red-700 transition-all">
            <div className="p-8 flex-grow">
               <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-white">
                     <Briefcase className="w-6 h-6" />
                   </div>
                   <div>
                     <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight font-heading group-hover:text-red-700 transition-colors leading-tight">{project.name}</h3>
                     <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{project.client_name}</p>
                   </div>
                 </div>
                 <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                   project.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                 }`}>
                   {project.status.replace('-', ' ')}
                 </span>
               </div>

               <div className="grid grid-cols-2 gap-8">
                 <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Operational Budget</p>
                    <p className="text-lg font-black text-slate-950 tracking-tighter">${project.budget.toLocaleString()}</p>
                 </div>
                 <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Deployment Date</p>
                    <div className="flex items-center text-xs font-bold text-slate-950 uppercase tracking-widest mt-1">
                      <Calendar className="w-3.5 h-3.5 mr-2 text-red-700" />
                      {new Date(project.start_date).toLocaleDateString()}
                    </div>
                 </div>
               </div>
            </div>
            
            <button className="w-full py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-slate-950 hover:text-white transition-all group-hover:border-red-700">
               Access Deployment Details
               <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
      {!loading && projects.length === 0 && (
        <div className="p-20 text-center bg-white rounded-2xl border border-zinc-200 border-dashed">
          <Activity className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">No operations currently active in matrix</p>
        </div>
      )}
    </div>
  );
};

export default Projects;