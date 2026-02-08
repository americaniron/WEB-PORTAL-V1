import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgStyles = {
    success: 'border-emerald-100 bg-white shadow-emerald-900/5',
    error: 'border-red-100 bg-white shadow-red-900/5',
    info: 'border-blue-100 bg-white shadow-blue-900/5'
  };

  return (
    <div className={`flex items-center p-4 mb-4 border rounded-xl shadow-2xl animate-in slide-in-from-right-10 duration-300 ${bgStyles[type]}`}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="ml-3 text-[11px] font-black uppercase tracking-widest text-slate-900">{message}</div>
      <button onClick={() => onClose(id)} className="ml-auto -mx-1.5 -my-1.5 p-1.5 inline-flex text-slate-400 hover:text-slate-900 rounded-lg focus:ring-2 focus:ring-slate-300">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;