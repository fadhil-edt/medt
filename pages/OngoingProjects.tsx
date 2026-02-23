
import React, { useState } from 'react';
import { useProjects } from '../lib/ProjectContext';
import { Project, ProjectStatus, ProjectType } from '../types';
import { ChevronRight, Edit3, GripVertical, Plus, X, Check, Lock, Building2, Globe, ExternalLink, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import { FigmaIcon, GDriveIcon } from '../components/BrandIcons';

const OpsCard: React.FC<{ 
  project: Project; 
  onEdit: (p: Project) => void;
  onDelivered: (id: string) => void;
  canSeeFinancials: boolean;
  taskCount: number;
}> = ({ project, onEdit, onDelivered, canSeeFinancials, taskCount }) => {
  const statusMap: Record<string, string> = {
    'Pre Prod': 'bg-purple-50 dark:bg-purple-900/20 text-purple-500',
    'Development': 'bg-blue-50 dark:bg-blue-900/20 text-blue-500',
    'Closure': 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('projectId', String(project.id));
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-40');
    e.currentTarget.classList.add('scale-95');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-40');
    e.currentTarget.classList.remove('scale-95');
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-lg transition-all group relative animate-in slide-in-from-bottom-2 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-shrink-0 items-center justify-center font-black text-xs text-indigo-600">
           {project.client_name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-black text-slate-800 dark:text-white leading-tight line-clamp-1">
              {project.project_name}
            </h4>
            <span className={`flex-shrink-0 text-[6px] font-black uppercase px-1 py-0.5 rounded ${project.project_type === 'Internal' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {project.project_type === 'Internal' ? 'INT' : 'SVC'}
            </span>
          </div>
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

      <div className="flex gap-1.5 mb-3">
         <a href={project.figma_link || '#'} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[8px] font-black uppercase hover:bg-gray-100 transition-all shadow-sm border border-gray-100 dark:border-slate-800">
            <FigmaIcon className="w-2.5 h-2.5" /> Figma
         </a>
         <a href={project.gdrive_link || '#'} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[8px] font-black uppercase hover:bg-gray-100 transition-all shadow-sm border border-gray-100 dark:border-slate-800">
            <GDriveIcon className="w-2.5 h-2.5" /> Drive
         </a>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-50 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-gray-100 dark:border-slate-700 p-0.5">
           <div className="h-full bg-[#1061C3] dark:bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${project.progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-[9px] font-bold">
        <div className="flex flex-col">
          <span className="text-gray-400 uppercase tracking-widest mb-0.5">Budget</span>
          <span className="text-slate-800 dark:text-slate-200">
            {canSeeFinancials ? (
              project.project_type === 'Internal' ? 'INT' : `RM ${(project.budget/1000).toFixed(1)}k`
            ) : <Lock className="w-2.5 h-2.5 opacity-30" />}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-gray-400 uppercase tracking-widest mb-0.5">Deadline</span>
          <span className="text-slate-800 dark:text-slate-200 truncate">{new Date(project.delivery_date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Phase</span>
        <span className={`text-[9px] font-black px-3 py-0.5 rounded-full ${statusMap[project.status]}`}>{project.status}</span>
      </div>

      {project.status === 'Closure' && (
        <button 
          onClick={() => onDelivered(project.id)}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-sm"
        >
          <Check className="w-3 h-3" /> Delivered
        </button>
      )}
    </div>
  );
};

const OngoingProjects: React.FC = () => {
  const { projects, tasks, updateProjectStatus, addProject, updateProject, permissions, currentUserRole } = useProjects();
  const ongoingProjects = projects.filter(p => ['Pre Prod', 'Development', 'Closure'].includes(p.status));
  const canSeeFinancials = permissions[currentUserRole].viewFinancials;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [dragCounter, setDragCounter] = useState<Record<string, number>>({});
  
  const [formData, setFormData] = useState<Partial<Project>>({ 
    status: 'Pre Prod', project_type: 'Servicing', budget: 0, progress: 0, has_event: false, figma_link: '', gdrive_link: '' 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateProject({ ...editingProject, ...formData } as Project);
    } else {
      addProject({ 
        id: Math.random().toString(36).substr(2, 9), 
        ...formData, 
        start_date: formData.kickoff_date,
        budget: formData.project_type === 'Internal' ? 0 : Number(formData.budget)
      } as Project);
    }
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleDeliverConfirm = () => {
    if (confirmId) {
      updateProjectStatus(confirmId, 'Completed');
      setConfirmId(null);
    }
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
    const projectId = e.dataTransfer.getData('projectId');
    if (projectId) {
      updateProjectStatus(projectId, status);
    }
  };

  return (
    <div className="h-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Ongoing Projects</h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Live Delivery Tracking</p>
        </div>
        <button onClick={() => { setEditingProject(null); setFormData({ status: 'Pre Prod', project_type: 'Servicing', budget: 0, kickoff_date: new Date().toISOString().split('T')[0], delivery_date: new Date().toISOString().split('T')[0], has_event: false }); setIsModalOpen(true); }} className="bg-[#0D2440] dark:bg-blue-600 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-[10px] font-black flex items-center transition-all shadow-lg transform active:scale-95">
          <Plus className="w-4 h-4 mr-2" /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10 h-[calc(100vh-200px)]">
        {(['Pre Prod', 'Development', 'Closure'] as ProjectStatus[]).map(status => (
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
                <div className={`w-2 h-2 rounded-full ${status === 'Pre Prod' ? 'bg-purple-400' : status === 'Development' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                {status}
              </h2>
              <span className="text-[9px] font-black text-gray-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full shadow-sm border border-gray-100 dark:border-slate-800">
                {ongoingProjects.filter(p => p.status === status).length}
              </span>
            </div>
            <div className={`space-y-4 flex-1 p-3 rounded-[2rem] border transition-colors duration-300 overflow-y-auto scrollbar-hide ${
              dragOverStatus === status 
                ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-400 dark:border-indigo-600 border-dashed' 
                : 'bg-gray-50/50 dark:bg-slate-800/20 border-gray-100 dark:border-slate-800'
            }`}>
              {ongoingProjects.filter(p => p.status === status).map(project => (
                <OpsCard 
                  key={project.id} 
                  project={project} 
                  onEdit={(p) => { setEditingProject(p); setFormData(p); setIsModalOpen(true); }} 
                  onDelivered={(id) => setConfirmId(id)}
                  canSeeFinancials={canSeeFinancials}
                  taskCount={tasks.filter(t => String(t.project_id) === String(project.id)).length}
                />
              ))}
              {ongoingProjects.filter(p => p.status === status).length === 0 && (
                <div className="h-32 flex items-center justify-center text-[9px] font-black text-gray-300 uppercase italic">Sector Clear</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0D2440]/40 dark:bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-[#F4F7FE]/50 dark:bg-slate-800/50">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all"><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-4 mb-4">
                <label className="text-xs font-black text-gray-400 uppercase block tracking-widest">Project Type</label>
                <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl w-full">
                   <button 
                     type="button"
                     onClick={() => setFormData({...formData, project_type: 'Internal'})}
                     className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${formData.project_type === 'Internal' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-slate-600'}`}
                   >
                     <Building2 className="w-3.5 h-3.5" /> Internal
                   </button>
                   <button 
                     type="button"
                     onClick={() => setFormData({...formData, project_type: 'Servicing'})}
                     className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${formData.project_type === 'Servicing' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-slate-600'}`}
                   >
                     <Globe className="w-3.5 h-3.5" /> Servicing
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase">Project Name</label>
                  <input required className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none text-slate-800 dark:text-white font-bold" value={formData.project_name || ''} onChange={e => setFormData({...formData, project_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase">Client Name</label>
                  <input required className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none text-slate-800 dark:text-white font-bold" value={formData.client_name || ''} onChange={e => setFormData({...formData, client_name: e.target.value})} />
                </div>
              </div>
              
              {canSeeFinancials && formData.project_type === 'Servicing' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-black text-gray-400 uppercase">Project Budget (RM)</label>
                  <input type="number" className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none text-slate-800 dark:text-white font-bold" value={formData.budget || ''} onChange={e => setFormData({...formData, budget: Number(e.target.value)})} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase">Figma Link</label>
                  <input className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none text-slate-800 dark:text-white font-bold" placeholder="https://figma.com/..." value={formData.figma_link || ''} onChange={e => setFormData({...formData, figma_link: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase">Google Drive Link</label>
                  <input className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none text-slate-800 dark:text-white font-bold" placeholder="https://drive.google.com/..." value={formData.gdrive_link || ''} onChange={e => setFormData({...formData, gdrive_link: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase">Kickoff Date</label>
                  <input type="date" className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none text-slate-800 dark:text-white font-bold" value={formData.kickoff_date || ''} onChange={e => setFormData({...formData, kickoff_date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase">Delivery Date</label>
                  <input type="date" className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none text-slate-800 dark:text-white font-bold" value={formData.delivery_date || ''} onChange={e => setFormData({...formData, delivery_date: e.target.value})} />
                </div>
              </div>
              <div className="pt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-black uppercase text-gray-400">Cancel</button>
                <button type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDeliverConfirm}
        title="Mark Project as Delivered?"
        message="This will move the project to the Archive under Completed Projects. This signifies successful job completion and revenue recognition."
        confirmLabel="Deliver Project"
        confirmColor="emerald"
      />
    </div>
  );
};

export default OngoingProjects;
