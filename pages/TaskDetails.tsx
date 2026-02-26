
import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../lib/ProjectContext';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Layers, 
  User as UserIcon, 
  AlignLeft, 
  AlertCircle,
  CalendarPlus,
  ExternalLink,
  Briefcase,
  Tag
} from 'lucide-react';
import { cloudService } from '../lib/googleSheetsService';

const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { tasks, projects, staff, toggleTaskStatus, isSyncing } = useProjects();
  const navigate = useNavigate();

  const task = useMemo(() => tasks.find(t => String(t.id) === String(id)), [tasks, id]);
  const project = useMemo(() => task ? projects.find(p => String(p.id) === String(task.project_id)) : null, [task, projects]);
  const assignee = useMemo(() => task ? staff.find(s => s.name.trim().toLowerCase() === task.assigned_to?.trim().toLowerCase()) : null, [task, staff]);

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-[2rem] flex items-center justify-center text-rose-500">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Task Not Found</h2>
          <p className="text-gray-500 mt-2">The task you're looking for doesn't exist or has been removed.</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleCalendarSync = () => {
    const url = cloudService.generateGCalUrl(task.task_name, task.due_date || task.start_date);
    window.open(url, '_blank');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30';
      case 'Med': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30';
      case 'Low': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30';
      default: return 'text-gray-500 bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-800';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-slate-800 dark:hover:text-white font-black text-xs uppercase tracking-widest transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          {isSyncing && <Clock className="w-4 h-4 text-indigo-500 animate-spin" />}
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Task ID: {task.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-start justify-between mb-8">
              <div className="space-y-4">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getPriorityColor(task.priority)}`}>
                  <Tag className="w-3 h-3" />
                  {task.priority} Priority
                </div>
                <h1 className={`text-4xl font-black tracking-tight leading-tight ${task.status === 'Done' ? 'text-gray-400 line-through' : 'text-slate-800 dark:text-white'}`}>
                  {task.task_name}
                </h1>
              </div>
              <button 
                onClick={() => toggleTaskStatus(task.id)}
                className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all transform active:scale-90 shadow-sm border ${
                  task.status === 'Done' 
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-100 dark:shadow-none' 
                    : 'bg-white dark:bg-slate-800 text-gray-300 border-gray-100 dark:border-slate-700 hover:text-indigo-500 hover:border-indigo-200'
                }`}
              >
                {task.status === 'Done' ? <CheckCircle2 className="w-8 h-8" /> : <Circle className="w-8 h-8" />}
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 text-slate-800 dark:text-white">
                <AlignLeft className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-black uppercase tracking-widest">Description</h3>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-[2rem] p-8 border border-gray-100 dark:border-slate-800">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {task.task_description || "No description provided for this task."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 pt-10 border-t border-gray-50 dark:border-slate-800">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-800 dark:text-white">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Timeline</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Start Date</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{task.start_date || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</span>
                    <span className="text-sm font-bold text-rose-500">{task.due_date || 'N/A'}</span>
                  </div>
                  {task.completed_at && (
                    <div className="flex justify-between items-center p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Completed</span>
                      <span className="text-sm font-bold text-emerald-600">{new Date(task.completed_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-800 dark:text-white">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Effort & Status</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scope Size</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{task.scope_size} Units</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Status</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      task.status === 'Done' ? 'bg-emerald-100 text-emerald-600' : 
                      task.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Context */}
        <div className="lg:col-span-4 space-y-8">
          {/* Project Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <Layers className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-black uppercase tracking-widest">Project Context</h3>
            </div>
            {project ? (
              <Link to={`/projects/${project.id}`} className="block group">
                <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-[2rem] border border-transparent group-hover:border-indigo-200 transition-all">
                  <h4 className="text-lg font-black text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors mb-2">
                    {project.project_name}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Briefcase className="w-3 h-3" />
                    {project.client_name}
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">View Project</span>
                    <ExternalLink className="w-4 h-4 text-indigo-500 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ) : (
              <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-[2rem] text-center">
                <p className="text-gray-400 font-bold text-xs uppercase italic">Project data unavailable</p>
              </div>
            )}
          </div>

          {/* Assignee Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <UserIcon className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-black uppercase tracking-widest">Assigned To</h3>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-[2rem]">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-indigo-100">
                {assignee?.avatar_url ? (
                  <img src={assignee.avatar_url} alt={task.assigned_to} className="w-full h-full object-cover" />
                ) : (
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${task.assigned_to}`} alt={task.assigned_to} className="w-full h-full" />
                )}
              </div>
              <div>
                <h4 className="font-black text-slate-800 dark:text-white">{task.assigned_to}</h4>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{assignee?.role || 'Team Member'}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <button 
              onClick={handleCalendarSync}
              className="w-full py-5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] text-slate-800 dark:text-white font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-md hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
            >
              <CalendarPlus className="w-5 h-5 text-indigo-500" />
              Sync to G-Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
