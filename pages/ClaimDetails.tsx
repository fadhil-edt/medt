
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../lib/ProjectContext';
import { ArrowLeft, Plus, Wallet, CheckCircle2, Trash2, X, DollarSign, Calendar, GripVertical, FileText, Info, ShieldAlert } from 'lucide-react';
import { ClaimMilestone } from '../types';

const ClaimDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, updateProjectClaims, toggleMilestoneClaim, reorderProjectClaims } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState<Partial<ClaimMilestone>>({ description: '', percentage: 0, invoice_no: '', notes: '' });
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const project = projects.find(p => String(p.id) === String(id));
  
  if (!project) return <div className="p-20 text-center font-black">Project Not Found</div>;

  // Block access to claims for internal projects
  if (project.project_type === 'Internal') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[2.5rem]">
          <ShieldAlert className="w-16 h-16 text-amber-500" />
        </div>
        <div className="text-center">
           <h2 className="text-3xl font-black text-slate-800 dark:text-white">Internal Project Detected</h2>
           <p className="text-gray-400 mt-2 font-medium">Internal projects do not track financial claims or billing milestones.</p>
        </div>
        <button onClick={() => navigate('/claims')} className="bg-[#0D2440] text-white px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95">Back to Claims Hub</button>
      </div>
    );
  }

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestone.description || !newMilestone.percentage) return;
    
    // Explicit amount calculation based on project budget
    const calculatedAmount = (project.budget * (Number(newMilestone.percentage) / 100));
    
    const milestone: ClaimMilestone = {
      id: Math.random().toString(36).substr(2, 9),
      project_id: project.id,
      invoice_no: newMilestone.invoice_no,
      description: newMilestone.description as string,
      percentage: Number(newMilestone.percentage),
      amount: calculatedAmount,
      isClaimed: false,
      notes: newMilestone.notes
    };

    updateProjectClaims(project.id, [...(project.claims || []), milestone]);
    setIsModalOpen(false);
    setNewMilestone({ description: '', percentage: 0, invoice_no: '', notes: '' });
  };

  const removeMilestone = (milestoneId: string) => {
    updateProjectClaims(project.id, (project.claims || []).filter(m => m.id !== milestoneId));
  };

  const onDragStart = (index: number) => setDraggedItemIndex(index);

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const newClaims = [...(project.claims || [])];
    const draggedItem = newClaims[draggedItemIndex];
    newClaims.splice(draggedItemIndex, 1);
    newClaims.splice(index, 0, draggedItem);
    setDraggedItemIndex(index);
    reorderProjectClaims(project.id, newClaims);
  };

  const totalPercentage = (project.claims || []).reduce((sum, m) => sum + m.percentage, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 font-bold transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Claims Hub
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded uppercase tracking-[0.2em] shadow-sm">Revenue Portal</span>
            </div>
            <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2">{project.project_name}</h1>
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{project.client_name} • Billing Strategy</p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 px-8 py-4 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/50 shadow-inner">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Contract Value</p>
            <p className="text-2xl font-black text-indigo-600">RM {project.budget.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-4">
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
               <FileText className="w-4 h-4" /> Billing Milestones
             </h3>
             <button 
               onClick={() => setIsModalOpen(true)}
               disabled={totalPercentage >= 100}
               className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-black text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed transition-all"
             >
               <Plus className="w-4 h-4" /> Add Payment Step
             </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {(project.claims || []).map((m, index) => {
              const amount = m.amount || (project.budget * (m.percentage / 100));
              return (
                <div 
                  key={m.id} 
                  draggable
                  onDragStart={() => onDragStart(index)}
                  onDragOver={(e) => onDragOver(e, index)}
                  onDragEnd={() => setDraggedItemIndex(null)}
                  className={`flex items-center gap-6 p-6 rounded-[2rem] border transition-all ${
                    draggedItemIndex === index ? 'opacity-40 border-indigo-400 scale-[0.98]' : ''
                  } ${m.isClaimed ? 'bg-emerald-50/30 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/50' : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800'} cursor-grab active:cursor-grabbing hover:shadow-md group`}
                >
                   <div className="flex items-center gap-4">
                     <GripVertical className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${m.isClaimed ? 'bg-emerald-500 text-white' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 shadow-inner'}`}>
                        {m.percentage}%
                     </div>
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Phase {index + 1}</span>
                        <h4 className="font-black text-slate-800 dark:text-white truncate">{m.description}</h4>
                        {m.invoice_no && <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg font-black text-slate-500 uppercase tracking-tighter shadow-sm">INV: {m.invoice_no}</span>}
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Amount: RM {amount.toLocaleString()}</p>
                        {m.notes && <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase italic"><Info className="w-3 h-3"/> Memo Linked</div>}
                      </div>
                   </div>

                   {m.isClaimed ? (
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Revenue Claimed</p>
                           <p className="text-[9px] font-bold text-gray-400 uppercase">{m.claimedDate}</p>
                        </div>
                        <button onClick={() => toggleMilestoneClaim(project.id, m.id)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-emerald-500 border border-emerald-100 dark:border-emerald-900/50 shadow-sm active:scale-95 transition-all">
                           <CheckCircle2 className="w-6 h-6" />
                        </button>
                      </div>
                   ) : (
                      <div className="flex items-center gap-4">
                        <button onClick={() => removeMilestone(m.id)} className="p-3 text-gray-300 hover:text-rose-500 transition-colors">
                           <Trash2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => toggleMilestoneClaim(project.id, m.id)}
                          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95"
                        >
                          Mark as Paid
                        </button>
                      </div>
                   )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-10 p-8 bg-gray-50 dark:bg-slate-800/30 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-inner">
           <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contract Allocation Progress</p>
              <p className="text-xs font-black text-slate-800 dark:text-white">{totalPercentage}% of RM {project.budget.toLocaleString()}</p>
           </div>
           <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-700 ${totalPercentage > 100 ? 'bg-rose-500' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]'}`}
                style={{ width: `${Math.min(totalPercentage, 100)}%` }}
              />
           </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0D2440]/40 dark:bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-md shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Assign Milestone</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all"><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddMilestone} className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest">Description</label>
                <input required className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-slate-800 dark:text-white font-bold transition-all shadow-inner" placeholder="e.g. Project Initiation Deposit" value={newMilestone.description} onChange={e => setNewMilestone({...newMilestone, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest">INV #</label>
                  <input className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-slate-800 dark:text-white font-bold transition-all shadow-inner" placeholder="INV-2024-..." value={newMilestone.invoice_no} onChange={e => setNewMilestone({...newMilestone, invoice_no: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest">Weight (%)</label>
                  <input required type="number" min="1" max={100 - totalPercentage} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-slate-800 dark:text-white font-bold transition-all shadow-inner" value={newMilestone.percentage || ''} onChange={e => setNewMilestone({...newMilestone, percentage: Number(e.target.value)})} />
                </div>
              </div>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/20 text-center">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Calculated Amount</p>
                <p className="text-lg font-black text-indigo-600">RM {((project.budget * (Number(newMilestone.percentage) || 0)) / 100).toLocaleString()}</p>
              </div>
              <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-black uppercase text-gray-400">Cancel</button>
                <button type="submit" className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-indigo-100 active:scale-95 transition-all">Confirm Step</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimDetails;
