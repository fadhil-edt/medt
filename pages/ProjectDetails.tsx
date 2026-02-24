
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../lib/ProjectContext';
import { DollarSign, CheckCircle2, Circle, ArrowLeft, Plus, X, ChevronDown, Rocket, Clock, User, Edit3, Layers, GripVertical, Calendar, Lock, Globe, Building2, Phone, UserPlus, Tag, RefreshCw, AlignLeft, BarChart2, LayoutGrid } from 'lucide-react';
import { Task, ProjectStatus, Project, ProjectType, TaskPriority } from '../types';
import { FigmaIcon, GDriveIcon } from '../components/BrandIcons';

const RadialScopeSelector: React.FC<{
  value: number;
  onChange: (val: number) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scopeValues = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
  const radius = 85;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex flex-col items-center" ref={containerRef}>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 w-full text-center">Scope Size</label>
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div className={`absolute inset-0 rounded-full border-2 border-dashed border-gray-100 dark:border-slate-800 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
        {scopeValues.map((val, index) => {
          const angle = (index * (360 / scopeValues.length)) - 90;
          const x = radius * Math.cos((angle * Math.PI) / 180);
          const y = radius * Math.sin((angle * Math.PI) / 180);
          return (
            <button
              key={val} type="button" onClick={() => { onChange(val); setIsOpen(false); }}
              className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 transform shadow-sm border
                ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}
                ${value === val ? 'bg-indigo-600 text-white border-indigo-600 z-10' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-100 dark:border-slate-700 hover:border-indigo-300'}`}
              style={{ left: `calc(50% + ${x}px - 20px)`, top: `calc(50% + ${y}px - 20px)`, transitionDelay: isOpen ? `${index * 30}ms` : '0ms' }}
            >{val.toFixed(1)}</button>
          );
        })}
        <button type="button" onClick={() => setIsOpen(!isOpen)} className={`group relative w-16 h-16 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 z-20 shadow-lg border ${isOpen ? 'bg-white dark:bg-slate-700 border-indigo-200' : 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-900/50'}`}>
          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 leading-none mb-1">{value.toFixed(1)}</span>
          <Layers className={`w-3 h-3 text-indigo-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
};

const TaskCard: React.FC<{ task: Task; onEdit: (t: Task) => void }> = ({ task, onEdit }) => {
  const priorityColors = {
    High: 'bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/50',
    Med: 'bg-amber-50 text-amber-500 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/50',
    Low: 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-900/20 dark:border-slate-800'
  };

  return (
    <div 
      draggable 
      onDragStart={(e) => { e.dataTransfer.setData('taskId', String(task.id)); (e.currentTarget as HTMLElement).style.opacity = '0.5'; }} 
      onDragEnd={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
      className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all group cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">{task.task_name}</h4>
          {task.task_description && (
            <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed italic">{task.task_description}</p>
          )}
        </div>
        <button onClick={() => onEdit(task)} className="p-1 rounded-md text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ml-2"><Edit3 className="w-3.5 h-3.5" /></button>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${priorityColors[task.priority]}`}>{task.priority} Priority</span>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400"><User className="w-3 h-3" /></div>
          <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase">{task.assigned_to}</span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-slate-800">
        <div className="flex items-center gap-3 text-gray-400 font-bold uppercase text-[9px]">
          <span className="flex items-center gap-1"><Layers className="w-2.5 h-2.5" /> {Number(task.scope_size || 0).toFixed(1)}</span>
          {task.due_date && <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {new Date(task.due_date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>}
        </div>
        <GripVertical className="w-3 h-3 text-gray-200" />
      </div>
    </div>
  );
};

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, tasks, staff, addTask, updateTask, updateProjectStatus, updateProject, currentUserRole, permissions, isSyncing, currentUserName } = useProjects();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectEditOpen, setIsProjectEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({ 
    task_name: '', 
    task_description: '',
    assigned_to: currentUserName, // Default to self
    status: 'Pending', 
    scope_size: 1.0, 
    priority: 'Med',
    start_date: '',
    due_date: ''
  });
  const [projectFormData, setProjectFormData] = useState<Partial<Project>>({});

  // Ensure string comparison for spreadsheet IDs that might arrive as numbers
  const project = projects.find((p) => String(p.id) === String(id));
  const projectTasks = tasks.filter((t) => String(t.project_id) === String(id));

  useEffect(() => { if (project) setProjectFormData(project); }, [project]);

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskData.task_name || !id) return;
    if (editingTask) updateTask({ ...editingTask, ...newTaskData } as Task);
    else addTask({ id: Math.random().toString(36).substr(2, 9), project_id: String(id), priority: 'Med', ...newTaskData } as Task);
    setIsTaskModalOpen(false);
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (project && projectFormData) updateProject({ ...project, ...projectFormData } as Project);
    setIsProjectEditOpen(false);
  };

  // Show loading while cloud sync is active and project is not found yet
  if (isSyncing && !project) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Connecting to Workspace Cloud...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-full">
          <Rocket className="w-12 h-12 text-rose-500 rotate-180" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Project Not Found</h2>
          <p className="text-sm text-gray-400 font-medium">This project may have been moved, deleted, or you have an invalid link.</p>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl relative pb-20 animate-in fade-in duration-500">
      <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-slate-400 mb-6 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 p-8 mb-10 overflow-hidden relative">
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">{project.client_name}</span>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm ${project.project_type === 'Internal' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {project.project_type}
              </span>
              {project.tags && <span className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase border border-gray-200 px-2 py-0.5 rounded-full"><Tag className="w-2.5 h-2.5"/> {project.tags}</span>}
            </div>
            <div className="flex items-center gap-4 mt-2 mb-6">
              <h1 className="text-4xl font-black text-gray-900 dark:text-white">{project.project_name}</h1>
              <button onClick={() => setIsProjectEditOpen(true)} className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-blue-500 rounded-xl transition-all shadow-sm"><Edit3 className="w-5 h-5" /></button>
            </div>
            
            <div className="flex flex-wrap gap-6 mb-8">
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-2xl"><UserPlus className="w-4.5 h-4.5 text-indigo-500" /></div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Client Contact</p>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">{project.contact_person || 'Not set'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-2xl"><Phone className="w-4.5 h-4.5 text-emerald-500" /></div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Phone / Mobile</p>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">{project.contact_phone || 'Not set'}</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center bg-indigo-50 dark:bg-indigo-900/10 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <DollarSign className="w-4 h-4 mr-2 text-indigo-500" />
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  {permissions[currentUserRole].viewFinancials ? `RM ${project.budget.toLocaleString()}` : 'CONFIDENTIAL'}
                </span>
              </div>
              {project.figma_link && (
                <a href={project.figma_link} target="_blank" rel="noreferrer" className="flex items-center bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-gray-100 hover:bg-indigo-500 hover:text-white transition-all">
                  <FigmaIcon className="w-4 h-4 mr-2" />
                  <span className="text-xs font-black uppercase">Figma</span>
                </a>
              )}
              {project.gdrive_link && (
                <a href={project.gdrive_link} target="_blank" rel="noreferrer" className="flex items-center bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-gray-100 hover:bg-blue-500 hover:text-white transition-all">
                  <GDriveIcon className="w-4 h-4 mr-2" />
                  <span className="text-xs font-black uppercase">Drive</span>
                </a>
              )}
            </div>
          </div>
          <div className="text-right ml-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-[0.1em]">Pipeline Stage</label>
            <div className="relative">
              <select 
                value={project.status} onChange={(e) => updateProjectStatus(project.id, e.target.value as ProjectStatus)}
                className="appearance-none bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-700 text-indigo-700 dark:text-indigo-400 text-sm font-black rounded-2xl px-6 py-3 pr-12 focus:outline-none transition-all cursor-pointer shadow-sm text-center"
              >
                {['Cold', 'Warm', 'Hot', 'Pre Prod', 'Development', 'Closure', 'Completed', 'Lost'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-indigo-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-6">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
               Project Workflow
               <span className="text-[10px] bg-indigo-600 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">{projectTasks.length} Active</span>
            </h3>
            <Link 
              to={`/projects/${id}/gantt`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-inner text-gray-400 hover:text-indigo-600 transition-all"
            >
              <BarChart2 className="w-4 h-4 rotate-90" />
              <span className="text-[9px] font-black uppercase tracking-widest">View Gantt Timeline</span>
            </Link>
          </div>
          <button onClick={() => { setEditingTask(null); setNewTaskData({ task_name: '', task_description: '', assigned_to: currentUserName, status: 'Pending', scope_size: 1.0, priority: 'Med', start_date: '', due_date: '' }); setIsTaskModalOpen(true); }} className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-black shadow-lg hover:shadow-indigo-200 transition-all active:scale-95 flex items-center">
            <Plus className="w-4 h-4 mr-2" /> New Task
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
          {(['Pending', 'In Progress', 'Done'] as Task['status'][]).map((status) => (
            <div 
              key={status} 
              className="flex-1 min-w-[320px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData('taskId');
                const t = tasks.find(t => String(t.id) === String(taskId));
                if (t) updateTask({ ...t, status });
              }}
            >
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 px-2">
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'Pending' ? 'bg-gray-400' : status === 'In Progress' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                {status}
              </h4>
              <div className="space-y-4 bg-gray-50/50 dark:bg-slate-900/50 p-5 rounded-[2.5rem] min-h-[500px] border border-gray-100 dark:border-slate-800">
                {projectTasks.filter(t => t.status === status).map(task => <TaskCard key={task.id} task={task} onEdit={(t) => { setEditingTask(t); setNewTaskData(t); setIsTaskModalOpen(true); }} />)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isProjectEditOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="px-10 py-8 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Admin Overrides</h3>
              <button onClick={() => setIsProjectEditOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleProjectSubmit} className="p-10 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase">Contact Name</label><input className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none dark:text-white font-bold" value={projectFormData.contact_person || ''} onChange={e => setProjectFormData({...projectFormData, contact_person: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase">Contact Phone</label><input className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none dark:text-white font-bold" value={projectFormData.contact_phone || ''} onChange={e => setProjectFormData({...projectFormData, contact_phone: e.target.value})} /></div>
              </div>
              <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase">Tags (Comma Separated)</label><input className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none dark:text-white font-bold" value={projectFormData.tags || ''} onChange={e => setProjectFormData({...projectFormData, tags: e.target.value})} /></div>
              <div className="pt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setIsProjectEditOpen(false)} className="px-6 py-3 text-xs font-black uppercase text-gray-400">Cancel</button>
                <button type="submit" className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs">Update Cloud</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">{editingTask ? 'Edit Task' : 'New Assignment'}</h3>
              <button onClick={() => setIsTaskModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleTaskSubmit} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
                <div className="md:col-span-7 space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest">Task Heading</label>
                    <input required className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none dark:text-white font-bold transition-all" value={newTaskData.task_name} onChange={e => setNewTaskData({...newTaskData, task_name: e.target.value})} />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest flex items-center gap-2">
                       <AlignLeft className="w-3 h-3" /> Operational Notes / Description
                    </label>
                    <textarea 
                      rows={4}
                      placeholder="Add specific details, links, or instructions for the assignee..."
                      className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none dark:text-white font-medium transition-all resize-none text-sm" 
                      value={newTaskData.task_description || ''} 
                      onChange={e => setNewTaskData({...newTaskData, task_description: e.target.value})} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest">Start Date</label>
                      <input type="date" className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none dark:text-white font-bold transition-all" value={newTaskData.start_date} onChange={e => setNewTaskData({...newTaskData, start_date: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest">Due Date</label>
                      <input type="date" className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none dark:text-white font-bold transition-all" value={newTaskData.due_date} onChange={e => setNewTaskData({...newTaskData, due_date: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest">Priority Rank</label>
                      <select className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none dark:text-white font-bold appearance-none cursor-pointer" value={newTaskData.priority} onChange={e => setNewTaskData({...newTaskData, priority: e.target.value as TaskPriority})}>
                        <option value="High">🔴 High Priority</option>
                        <option value="Med">🟡 Med Priority</option>
                        <option value="Low">⚪ Low Priority</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest">Assignee</label>
                      <select className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none dark:text-white font-bold appearance-none cursor-pointer" value={newTaskData.assigned_to} onChange={e => setNewTaskData({...newTaskData, assigned_to: e.target.value})}>
                        <option value="">Select Member</option>
                        {staff.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-5 bg-gray-50 dark:bg-slate-800 p-8 rounded-[2.5rem] flex flex-col items-center justify-center border border-gray-100 dark:border-slate-700 shadow-inner h-full min-h-[300px]">
                  <RadialScopeSelector value={Number(newTaskData.scope_size || 0)} onChange={(v) => setNewTaskData({...newTaskData, scope_size: v})} />
                  <p className="mt-8 text-[10px] font-bold text-gray-400 uppercase text-center max-w-[200px] leading-relaxed">Adjust resource units to reflect workload impact</p>
                </div>
              </div>
              
              <div className="pt-8 flex justify-end gap-4 border-t border-gray-50 dark:border-slate-800">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-6 py-3 text-xs font-black uppercase text-gray-400">Discard</button>
                <button type="submit" className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Sync Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
