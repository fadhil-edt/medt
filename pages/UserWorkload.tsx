
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../lib/ProjectContext';
import { ArrowLeft, Briefcase, Calendar, CheckCircle2, ChevronDown, ChevronRight, Clock, Layers, LayoutGrid, Rocket, User as UserIcon, ListFilter, AlertCircle, AlignLeft } from 'lucide-react';
import { Task, Project } from '../types';

const ProjectWorkloadBlock: React.FC<{ 
  project: Project; 
  userTasks: Task[];
}> = ({ project, userTasks }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const pendingTasks = userTasks.filter(t => t.status !== 'Done');
  const completedTasks = userTasks.filter(t => t.status === 'Done');
  const totalScope = userTasks.reduce((sum, t) => sum + (Number(t.scope_size) || 0), 0);

  const statusColors: Record<string, string> = {
    'Hot': 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/50',
    'Warm': 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/50',
    'Cold': 'text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700',
    'Pre Prod': 'text-purple-500 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900/50',
    'Development': 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50',
    'Closure': 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/50',
    'Completed': 'text-white bg-emerald-500 border-emerald-600',
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border shadow-sm transition-all duration-300 overflow-hidden flex flex-col h-fit ${isExpanded ? 'ring-2 ring-indigo-500 border-transparent' : 'border-gray-100 dark:border-slate-800 hover:border-indigo-200'}`}>
      <div className="p-7">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center font-black text-lg text-indigo-600 shadow-inner">
               {project.client_name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight truncate max-w-[180px]">{project.project_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded border ${statusColors[project.status] || 'bg-gray-100 text-gray-500'}`}>
                  {project.status}
                </span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest truncate">{project.client_name}</span>
              </div>
            </div>
          </div>
          <Link to={`/projects/${project.id}`} className="p-2.5 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-indigo-600 rounded-xl transition-all border border-gray-100 dark:border-slate-700">
            <ExternalLinkIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
           <div className="bg-indigo-50/40 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-50 dark:border-indigo-900/30">
              <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Load Impact</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{totalScope.toFixed(1)}</span>
                <span className="text-[9px] font-bold text-indigo-300 uppercase">Units</span>
              </div>
           </div>
           <div className="bg-emerald-50/40 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-50 dark:border-emerald-900/30">
              <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">In Queue</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{pendingTasks.length}</span>
                <span className="text-[9px] font-bold text-emerald-300 uppercase">Tasks</span>
              </div>
           </div>
        </div>

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${
            isExpanded ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'bg-gray-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-100 dark:border-slate-800'
          }`}
        >
          <span>{isExpanded ? 'Hide Breakdown' : `View ${userTasks.length} Assignments`}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isExpanded && (
        <div className="bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
          <div className="p-5 space-y-3 max-h-[350px] overflow-y-auto scrollbar-hide">
            {userTasks.map(task => (
              <div key={task.id} className="flex flex-col gap-2 p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${task.status === 'Done' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-indigo-50 text-indigo-500 border-indigo-100'}`}>
                      {task.status === 'Done' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[11px] font-black truncate leading-tight ${task.status === 'Done' ? 'text-gray-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                        {task.task_name}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/50 flex-shrink-0">
                    {Number(task.scope_size || 0).toFixed(1)}u
                  </span>
                </div>
                
                {task.task_description && (
                  <p className="text-[9px] text-gray-400 italic px-1 leading-relaxed line-clamp-2">{task.task_description}</p>
                )}

                <div className="flex items-center gap-2 mt-1">
                   <span className={`text-[6px] font-black uppercase px-1.5 py-0.5 rounded ${
                     task.priority === 'High' ? 'bg-rose-100 text-rose-600' : 
                     task.priority === 'Med' ? 'bg-amber-100 text-amber-600' : 
                     'bg-gray-100 text-gray-500'
                   }`}>{task.priority}</span>
                   <span className="text-[6px] font-black text-gray-400 uppercase tracking-widest">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'NO DATE'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ExternalLinkIcon = ({ className }: { className: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const UserWorkload: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { staff, tasks, projects } = useProjects();

  const member = staff.find(s => String(s.id) === String(id));
  
  const userTasksByProject = useMemo(() => {
    if (!member) return [];
    
    const memberTasks = tasks.filter(t => t.assigned_to?.trim().toLowerCase() === member.name?.trim().toLowerCase());
    
    const groups: Record<string, Task[]> = {};
    memberTasks.forEach(t => {
      if (!groups[t.project_id]) groups[t.project_id] = [];
      groups[t.project_id].push(t);
    });

    return Object.entries(groups).map(([projectId, tasks]) => {
      const project = projects.find(p => String(p.id) === String(projectId));
      return { project, tasks };
    }).filter(g => g.project !== undefined).sort((a, b) => b.tasks.length - a.tasks.length);

  }, [member, tasks, projects]);

  if (!member) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="p-8 bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem]">
          <AlertCircle className="w-16 h-16 text-rose-500" />
        </div>
        <div className="text-center">
           <h2 className="text-3xl font-black text-slate-800 dark:text-white">Workspace Member Not Found</h2>
           <p className="text-gray-400 mt-2 font-medium">This ID does not match any current active personnel.</p>
        </div>
        <button onClick={() => navigate('/team')} className="bg-[#0D2440] text-white px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95">Back to Directory</button>
      </div>
    );
  }

  const totalLoad = userTasksByProject.reduce((sum, g) => sum + g.tasks.filter(t => t.status !== 'Done').reduce((s, t) => s + (Number(t.scope_size) || 0), 0), 0);
  const activeTasksCount = userTasksByProject.reduce((sum, g) => sum + g.tasks.filter(t => t.status !== 'Done').length, 0);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32">
      {/* Header Profile Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <button onClick={() => navigate(-1)} className="p-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:text-indigo-600 transition-all hover:scale-105 active:scale-95 group">
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-50 dark:bg-slate-900 border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden flex-shrink-0 relative group">
               <img src={member.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${member.name}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                 <h1 className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-white leading-none tracking-tighter">{member.name}</h1>
                 <span className="hidden sm:block text-[9px] font-black bg-indigo-600 text-white px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 dark:shadow-none">{member.role_type} Rank</span>
              </div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">{member.role}</p>
            </div>
          </div>
        </div>
        
        {/* Rapid Stats Dashboard */}
        <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap">
          <div className="bg-white dark:bg-slate-900 px-8 py-5 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col justify-center min-w-[180px]">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Queue Density</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800 dark:text-white">{activeTasksCount}</span>
              <span className="text-[10px] font-bold text-gray-300 uppercase">Active</span>
            </div>
          </div>
          <div className="bg-[#000aff] dark:bg-indigo-600 px-8 py-5 rounded-[2.5rem] shadow-2xl shadow-indigo-100 dark:shadow-none flex flex-col justify-center min-w-[180px] text-white">
            <p className="text-[9px] font-black text-indigo-100 uppercase tracking-[0.2em] mb-1">Current Impact</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black">{totalLoad.toFixed(1)}</span>
              <span className="text-[10px] font-bold text-indigo-200 uppercase">Units</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Grid Section */}
      <div className="space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
           <div className="flex items-center gap-4">
              <div className="h-10 w-2 bg-indigo-500 rounded-full" />
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] flex items-center gap-4">
                  Stream Distribution
                </h2>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mt-0.5">Assigned projects in current cycle</p>
              </div>
           </div>
           <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-2.5 rounded-2xl border border-gray-100 dark:border-slate-800 text-gray-400 font-bold text-[10px] uppercase tracking-widest shadow-sm">
              <ListFilter className="w-4 h-4 text-indigo-400" /> 
              Ranked by Task Volume
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {userTasksByProject.map(({ project, tasks }) => (
            <ProjectWorkloadBlock key={project!.id} project={project!} userTasks={tasks} />
          ))}
          {userTasksByProject.length === 0 && (
            <div className="col-span-full py-40 text-center bg-gray-50/50 dark:bg-slate-900/30 rounded-[4rem] border-2 border-dashed border-gray-200 dark:border-slate-800">
               <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm border border-gray-100 dark:border-slate-800">
                  <Briefcase className="w-10 h-10 text-gray-200 dark:text-slate-700" />
               </div>
               <p className="text-gray-400 font-black uppercase tracking-[0.3em] leading-relaxed">
                 Operational Capacity: 100%<br/>
                 <span className="text-[10px] opacity-40 font-bold">This workspace unit is currently idle.</span>
               </p>
            </div>
          )}
        </div>
      </div>

      {/* Legend Footer */}
      <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-800 flex flex-wrap gap-10 items-center justify-center">
         <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Commitment</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Milestone Secured</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">High Priority Load</span>
         </div>
      </div>
    </div>
  );
};

export default UserWorkload;
