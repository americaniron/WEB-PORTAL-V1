import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { TimeEntry, Project } from '../types';
import { Clock, Plus, CheckCircle, XCircle } from 'lucide-react';

const TimeTracking = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newEntry, setNewEntry] = useState({
    project_id: '',
    date: new Date().toISOString().split('T')[0],
    hours: 8,
    description: '',
    is_billable: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [entriesData, projectsData] = await Promise.all([
          api.timeTracking.getAll(),
          api.projects.getAll()
        ]);
        setEntries(entriesData);
        setProjects(projectsData);
        if (projectsData.length > 0) {
            setNewEntry(prev => ({ ...prev, project_id: String(projectsData[0].id) }));
        }
      } catch (err) {
        console.error("Failed to fetch time tracking data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    if (isCheckbox) {
        const { checked } = e.target as HTMLInputElement;
        setNewEntry(prev => ({...prev, [name]: checked}));
    } else {
        setNewEntry(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setNewEntry({
      project_id: projects.length > 0 ? String(projects[0].id) : '',
      date: new Date().toISOString().split('T')[0],
      hours: 8,
      description: '',
      is_billable: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const createdEntry = await api.timeTracking.create({
        ...newEntry,
        project_id: Number(newEntry.project_id),
        hours: Number(newEntry.hours),
        user_id: 1, // Static user ID for now
      });
      setEntries([createdEntry, ...entries]);
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      console.error("Failed to create time entry", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getProjectName = (projectId: number) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900 uppercase font-heading">Time Tracking</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded shadow-sm text-sm font-bold text-white bg-red-700 hover:bg-red-800 transition-colors uppercase tracking-wider"
        >
          {showAddForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Entry</>}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-red-700">
          <h2 className="text-xl font-bold text-slate-900 mb-4 font-heading uppercase">Log New Time Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select name="project_id" value={newEntry.project_id} onChange={handleInputChange} required className="w-full border border-slate-300 rounded-md p-2">
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="date" name="date" value={newEntry.date} onChange={handleInputChange} required className="w-full border border-slate-300 rounded-md p-2" />
              <input type="number" name="hours" value={newEntry.hours} step="0.1" min="0" onChange={handleInputChange} placeholder="Hours" required className="w-full border border-slate-300 rounded-md p-2" />
            </div>
            <textarea name="description" value={newEntry.description} onChange={handleInputChange} placeholder="Description of work performed..." required className="w-full border border-slate-300 rounded-md p-2 h-24" />
            <div className="flex items-center gap-2">
                <input type="checkbox" id="is_billable" name="is_billable" checked={newEntry.is_billable} onChange={handleInputChange} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                <label htmlFor="is_billable" className="text-sm font-medium text-slate-700">This time is billable</label>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button type="submit" disabled={submitting} className="inline-flex items-center px-6 py-2 border border-transparent rounded shadow-sm text-sm font-bold text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 uppercase tracking-wider transition-colors">
                {submitting ? 'Saving...' : 'Log Time'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-sm border border-slate-200 overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider font-heading">Project</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider font-heading">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider font-heading">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider font-heading">Hours</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider font-heading">Billable</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-3/4"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-6 bg-slate-200 rounded-full"></div></td>
                  </tr>
                ))
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{getProjectName(entry.project_id)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{entry.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{entry.hours.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.is_billable 
                        ? <CheckCircle className="w-5 h-5 text-green-500" />
                        : <XCircle className="w-5 h-5 text-slate-400" />
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;
