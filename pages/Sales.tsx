
import React, { useState, useMemo } from 'react';
import { useProjects } from '../lib/ProjectContext';
import { Project, ProjectStatus, ProjectType, Task } from '../types';
import { Rocket, Edit3, GripVertical, Plus, X, ChevronRight, Lock, Phone, User, Tag, ChevronDown, CheckSquare, ExternalLink, Settings, AlertCircle, Clock, Zap, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import { FigmaIcon, GDriveIcon } from '../components/BrandIcons';

const ProjectCard: React.FC<{ 
  project: Project; 
  onEdit: (p: Project) => void;
  onGreenlight: (id: string) => void;
  onLost: (id: string) => void;
  canSeeFinancials: boolean;
  taskCount: number;
  tasks: Task[];
  thresholds: { hotToWarm: number; warmToCold: number; coldStagnant: number };
}> = ({ project, onEdit, onGreenlight, onLost, canSeeFinancials, taskCount, tasks, thresholds }) => {
  const statusMap: Record<ProjectStatus, { text: string; bg: string }> = {
    'Cold': { text: 'Cold', bg: 'bg-gray-100 dark:bg-slate-800 text-gray-500' },
    'Warm': { text: 'Warm', bg: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' },
    'Hot': { text: 'Hot', bg: 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' },
    'Pre Prod': { text: 'Pre Prod', bg: 'bg-purple-50 dark:bg-purple-900/20 text-purple-500' },
    'Development': { text: 'Developing', bg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' },
    'Closure': { text: 'Closing', bg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' },
    'Completed': { text: 'Completed', bg: 'bg-emerald-500 text-white' },
    'Lost': { text: 'Lost', bg: 'bg-red-500 text-white' }
  };
  const currentStatus = statusMap[project.status] || { text: project.status, bg: 'bg-gray-100 text-gray-500' };

  // Calculate inactivity for visual warning
  const projectTasks = tasks.filter(t => String(t.project_id) === String(project.id));
  const activityDates: number[] = [new Date(project.kickoff_date || project.start_date).getTime()];
  projectTasks.forEach(t => {
    if (t.start_date) activityDates.push(new Date(t.start_date).getTime());
    if (t.completed_at) activityDates.push(new Date(t.completed_at).getTime());
  });
  const lastActivity = Math.max(...activityDates);
  const diffDays = Math.floor((new Date().getTime() - lastActivity) / (1000 * 60 * 60 * 24));
  
  let currentThreshold = 999;
  if (project.status === 'Hot') currentThreshold = thresholds.hotToWarm;
  else if (project.status === 'Warm') currentThreshold = thresholds.warmToCold;
  else if (project.status === 'Cold') currentThreshold = thresholds.coldStagnant;

  const isStagnant = diffDays >= currentThreshold;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('projectId', String(project.id));
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-sm border hover:shadow-lg transition-all group relative animate-in slide-in-from-bottom-2 cursor-grab active:cursor-grabbing ${isStagnant ? 'border-amber-200 dark:border-amber-900/50' : 'border-gray-100 dark:border-slate-800'}`}
    >
      {isStagnant && (
        <div className="absolute -top-2 -right-1 z-10 flex items-center gap-1 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-tighter border border-amber-200 dark:border-amber-800 shadow-sm animate-pulse">
           <AlertCircle className="w-2 h-2" /> {project.status === 'Cold' ? 'POTENTIALLY LOST' : `STAGNANT ${diffDays}d`}
        </div>
      )}

      <div className="flex items-start gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-shrink-0 items-center justify-center font-black text-xs text-indigo-600">
           {project.client_name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 line-clamp-1 leading-tight">
            {project.project_name}
          </h4>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate">{project.client_name}</p>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <GripVertical className="w-3.5 h-3.5 text-gray-200" />
          <button onClick={() => onEdit(project)} className="p-1 rounded-lg text-gray-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
            <Edit3 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <Link to={`/projects/${project.id}`} className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-slate-800 rounded-lg text-[8px] font-black text-gray-400 uppercase transition-all hover:bg-indigo-50 hover:text-indigo-600 border border-transparent hover:border-indigo-100">
          <ExternalLink className="w-2.5 h-2.5" /> Details
        </Link>
        <Link to={`/projects/${project.id}`} className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-slate-800 rounded-lg text-[8px] font-black text-blue-600 uppercase transition-all hover:bg-blue-600 hover:text-white border border-blue-100 dark:border-slate-700">
          <CheckSquare className="w-2.5 h-2.5" /> {taskCount} Tasks
        </Link>
      </div>

      <div className="bg-gray-50 dark:bg-slate-800/30 rounded-xl p-2 mb-3 border border-gray-100 dark:border-slate-800/50 flex items-center justify-between">
         <div className="flex items-center gap-2 truncate">
            <User className="w-2.5 h-2.5 text-indigo-400" />
            <span className="text-[9px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest truncate">{project.contact_person || 'N/A'}</span>
         </div>
         <div className="flex items-center gap-2">
            <Phone className="w-2.5 h-2.5 text-emerald-400" />
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{project.contact_phone ? 'Set' : 'No #'}</span>
         </div>
      </div>

      <div className="flex justify-between items-center mb-4 text-[9px] font-bold">
        <div className="flex flex-col">
          <span className="text-gray-400 uppercase tracking-widest leading-none mb-1">Revenue</span>
          <span className="text-slate-800 dark:text-slate-300 leading-none">
            {canSeeFinancials ? `RM ${(project.budget/1000).toFixed(1)}k` : <Lock className="w-2.5 h-2.5 opacity-30" />}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-gray-400 uppercase tracking-widest leading-none mb-1">Status</span>
          <span className={`px-2 py-0.5 rounded-full font-black ${currentStatus.bg}`}>{currentStatus.text}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => onGreenlight(project.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-sm"
        >
          <Rocket className="w-2.5 h-2.5" /> Greenlight
        </button>
        <button 
          onClick={() => onLost(project.id)}
          className="px-3 py-1.5 bg-rose-50 text-rose-500 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100"
        >
          Lost
        </button>
      </div>
    </div>
  );
};

const Sales: React.FC = () => {
  const { projects, tasks, updateProjectStatus, addProject, updateProject, permissions, currentUserRole, automationSettings, updateAutomationSettings } = useProjects();
  const salesProjects = projects.filter(p => ['Cold', 'Warm', 'Hot'].includes(p.status));
  const canSeeFinancials = permissions[currentUserRole].viewFinancials;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [confirmData, setConfirmData] = useState<{ id: string, type: 'greenlight' | 'lost' } | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [dragCounter, setDragCounter] = useState<Record<string, number>>({});
  
  const [formData, setFormData] = useState<Partial<Project>>({
    status: 'Cold', budget: 0, progress: 0,
    project_type: 'Servicing' as ProjectType,
    kickoff_date: new Date().toISOString().split('T')[0],
    delivery_date: new Date().toISOString().split('T')[0],
    has_event: false,
    figma_link: '',
    gdrive_link: '',
    contact_person: '',
    contact_phone: '',
    tags: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateProject({ ...editingProject, ...formData } as Project);
    } else {
      addProject({ id: Math.random().toString(36).substr(2, 9), ...formData, project_type: 'Servicing', start_date: formData.kickoff_date } as Project);
    }
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleActionConfirm = () => {
    if (!confirmData) return;
    updateProjectStatus(confirmData.id, confirmData.type === 'greenlight' ? 'Pre Prod' : 'Lost');
    setConfirmData(null);
  };

  const onDragEnter = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragCounter(prev => ({ ...prev, [status]: (prev[status] || 0) + 1 }));
    setDragOverStatus(status);
  };

  const onDragLeave = (e: React.DragEvent, status: string) => {
    const newCount = (dragCounter[status] || 0) - 1;
    setDragCounter(prev => ({ ...prev, [status]: newCount }));
    if (newCount <= 0) {
      setDragOverStatus(null);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent, status: ProjectStatus) => {
    e.preventDefault();
    setDragOverStatus(null);
    setDragCounter({});
    const id = e.dataTransfer.getData('projectId');
    if (id) updateProjectStatus(id, status);
  };

  return (
    <div className="h-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-black text-slate-800 dark:text-white">Sales Pipeline</h1>
             <button 
               onClick={() => setIsSettingsOpen(!isSettingsOpen)}
               className={`p-2 rounded-xl transition-all ${isSettingsOpen ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-gray-400 border border-gray-100 dark:border-slate-800'}`}
               title="Pipeline Automations"
             >
                <Settings className="w-4 h-4" />
             </button>
          </div>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Lead Management & Funnel Tracking</p>
        </div>
        <button onClick={() => { setEditingProject(null); setFormData({ status: 'Cold', project_type: 'Servicing', budget: 0, kickoff_date: new Date().toISOString().split('T')[0], delivery_date: new Date().toISOString().split('T')[0], has_event: false }); setIsModalOpen(true); }} className="bg-[#0D2440] dark:bg-blue-600 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-[10px] font-black flex items-center transition-all shadow-lg transform active:scale-95">
          <Plus className="w-4 h-4 mr-2" /> New Prospect
        </button>
      </div>

      {isSettingsOpen && (
        <div className="mb-8 p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30 animate-in slide-in-from-top-4">
           <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-indigo-600 shadow-sm">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Inactivity Automations</h4>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">Define days of no tasks/updates before a lead drops tier.</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Hot → Warm
                 </label>
                 <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 px-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <input 
                      type="number"
                      className="w-full bg-transparent border-0 outline-none font-black text-indigo-600 dark:text-indigo-400 text-center"
                      value={automationSettings.salesThresholds.hotToWarm}
                      onChange={(e) => updateAutomationSettings({ ...automationSettings, salesThresholds: { ...automationSettings.salesThresholds, hotToWarm: Number(e.target.value) } })}
                    />
                    <span className="text-[9px] font-black text-gray-400 uppercase">Days</span>
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Warm → Cold
                 </label>
                 <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 px-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <input 
                      type="number"
                      className="w-full bg-transparent border-0 outline-none font-black text-indigo-600 dark:text-indigo-400 text-center"
                      value={automationSettings.salesThresholds.warmToCold}
                      onChange={(e) => updateAutomationSettings({ ...automationSettings, salesThresholds: { ...automationSettings.salesThresholds, warmToCold: Number(e.target.value) } })}
                    />
                    <span className="text-[9px] font-black text-gray-400 uppercase">Days</span>
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Cold Stagnant
                 </label>
                 <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 px-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <input 
                      type="number"
                      className="w-full bg-transparent border-0 outline-none font-black text-indigo-600 dark:text-indigo-400 text-center"
                      value={automationSettings.salesThresholds.coldStagnant}
                      onChange={(e) => updateAutomationSettings({ ...automationSettings, salesThresholds: { ...automationSettings.salesThresholds, coldStagnant: Number(e.target.value) } })}
                    />
                    <span className="text-[9px] font-black text-gray-400 uppercase">Days</span>
                 </div>
              </div>
           </div>

           <div className="mt-6 flex items-center gap-3 p-4 bg-white/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-indigo-100 dark:border-indigo-900/40">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <p className="text-[9px] font-bold text-gray-500 leading-relaxed">
                Leads move down one tier when the specified days pass without a task being created or completed. 
                <span className="text-indigo-500 ml-1">Cold leads only trigger a notification notice for manual archival.</span>
              </p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10 h-[calc(100vh-200px)]">
        {(['Cold', 'Warm', 'Hot'] as ProjectStatus[]).map(status => (
          <div 
            key={status} 
            className={`flex flex-col h-full transition-all duration-300 ${dragOverStatus === status ? 'scale-[1.01]' : ''}`}
            onDragEnter={(e) => onDragEnter(e, status)}
            onDragLeave={(e) => onDragLeave(e, status)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, status)}
          >
            <div className="flex items-center justify-between px-3 mb-3">
              <h2 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status === 'Cold' ? 'bg-gray-400' : status === 'Warm' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                {status} Leads
              </h2>
              <span className="text-[9px] font-black text-gray-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full shadow-sm border border-gray-100 dark:border-slate-800">
                {salesProjects.filter(p => p.status === status).length}
              </span>
            </div>
            <div className={`space-y-4 flex-1 p-3 rounded-[2rem] border transition-colors duration-300 overflow-y-auto scrollbar-hide ${
              dragOverStatus === status 
                ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-400 dark:border-indigo-600 border-dashed' 
                : 'bg-gray-50/50 dark:bg-slate-800/20 border-gray-100 dark:border-slate-800'
            }`}>
              {salesProjects.filter(p => p.status === status).map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onEdit={(p) => { setEditingProject(p); setFormData(p); setIsModalOpen(true); }} 
                  onGreenlight={(id) => setConfirmData({ id, type: 'greenlight' })}
                  onLost={(id) => setConfirmData({ id, type: 'lost' })}
                  canSeeFinancials={canSeeFinancials}
                  taskCount={tasks.filter(t => String(t.project_id) === String(project.id)).length}
                  tasks={tasks}
                  thresholds={automationSettings.salesThresholds}
                />
              ))}
              {salesProjects.filter(p => p.status === status).length === 0 && (
                <div className="h-32 flex items-center justify-center text-[9px] font-black text-gray-300 uppercase italic">Empty Sector</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0D2440]/40 dark:bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-[#F4F7FE]/50 dark:bg-slate-800/50">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">{editingProject ? 'Modify Prospect' : 'Add Prospect'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all"><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase">Project</label><input required className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none dark:text-white font-bold" value={formData.project_name || ''} onChange={e => setFormData({...formData, project_name: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase">Client</label><input required className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none dark:text-white font-bold" value={formData.client_name || ''} onChange={e => setFormData({...formData, client_name: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase">Contact Name</label><input className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none dark:text-white font-bold" value={formData.contact_person || ''} onChange={e => setFormData({...formData, contact_person: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase">Phone #</label><input className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none dark:text-white font-bold" value={formData.contact_phone || ''} onChange={e => setFormData({...formData, contact_phone: e.target.value})} /></div>
              </div>
              <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase">Tags</label><input placeholder="e.g. Urgent, Retainer, Video" className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none dark:text-white font-bold" value={formData.tags || ''} onChange={e => setFormData({...formData, tags: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase">Funnel Status</label><select className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none dark:text-white font-bold appearance-none cursor-pointer" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ProjectStatus})}><option value="Cold">Cold</option><option value="Warm">Warm</option><option value="Hot">Hot</option></select></div>
                {canSeeFinancials && <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase">Est. Revenue</label><input type="number" className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none dark:text-white font-bold" value={formData.budget || ''} onChange={e => setFormData({...formData, budget: Number(e.target.value)})} /></div>}
              </div>
              <div className="pt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-black uppercase text-gray-400">Cancel</button>
                <button type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs">Sync Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={!!confirmData}
        onClose={() => setConfirmData(null)}
        onConfirm={handleActionConfirm}
        title={confirmData?.type === 'greenlight' ? 'Authorize Delivery?' : 'Close Prospect?'}
        message={confirmData?.type === 'greenlight' ? 'This lead has been greenlighted for production. Operations will be notified.' : 'This lead will be moved to the archive as Lost.'}
        confirmLabel={confirmData?.type === 'greenlight' ? 'Greenlight' : 'Mark Lost'}
        confirmColor={confirmData?.type === 'greenlight' ? 'emerald' : 'red'}
      />
    </div>
  );
};

export default Sales;
