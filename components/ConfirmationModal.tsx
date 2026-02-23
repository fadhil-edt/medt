import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor?: 'blue' | 'red' | 'emerald';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, onClose, onConfirm, title, message, confirmLabel, confirmColor = 'blue' 
}) => {
  if (!isOpen) return null;

  const colorMap = {
    blue: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100',
    red: 'bg-red-600 hover:bg-red-700 shadow-red-100',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className={`mx-auto w-16 h-16 rounded-3xl mb-6 flex items-center justify-center ${confirmColor === 'red' ? 'bg-red-50 text-red-600' : confirmColor === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">{title}</h3>
          <p className="text-gray-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-4 p-8 pt-0">
          <button onClick={onClose} className="flex-1 px-6 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={`flex-1 px-6 py-3.5 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 ${colorMap[confirmColor]}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;