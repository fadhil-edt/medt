
import React, { useEffect } from 'react';
import { useProjects } from '../lib/ProjectContext';
import { CheckCircle2, Circle, Clock, Layers, Calendar, ExternalLink, CalendarPlus, RefreshCw, User as UserIcon, AlignLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cloudService } from '../lib/googleSheetsService';

const MyTasks: React.FC = () => {
  const { tasks, projects, currentUserName, currentUser, toggleTaskStatus, refreshData, isSyncing } = useProjects();
  
  // Local polling removed - now handled globally by ProjectProvider to ensure 
  // notifications work across all pages.

  // Case-insensitive matching for assigned tasks
  const myTasks = tasks.filter(t => 
    t.assigned_to?.trim().toLowerCase() === currentUserName?.trim().toLowerCase()
  );
  
  const pendingTasks = myTasks.filter(t => t.status !== 'Done');
  
  // Completed task cleanup: Hide tasks completed more than 5 days ago
  const completedTasks = myTasks.filter(t => {
    if (t.status !== 'Done') return false;
    if (!t.completed_at) return true; // Show if timestamp is missing
    const completedDate = new Date(t.completed_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - completedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 5;
  });

  const getProjectName = (projectId: string) => {
    return projects.find(p => String(p.id) === String(projectId))?.project_name || 'Unknown Project';
  };

  const handleCalendarSync = (e: React.MouseEvent, task: any) => {
    e.preventDefault();
    e.stopPropagation();
    const url = cloudService.generateGCalUrl(task.task_name, task.due_date || task.start_date);
    window.open(url, '_blank');
  };

  const TaskItem: React.FC<{ task: any; isSmall?: boolean }> = ({ task, isSmall }) => (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-start gap-4 group hover:shadow-md transition-all ${isSmall ? 'p-4' : 'p-6'}`}>
      <button 
        onClick={() => toggleTaskStatus(task.id)}
        className={`flex-shrink-0 mt-1 transition-all transform active:scale-90 ${task.status === 'Done' ? 'text-emerald-500' : 'text-gray-300 hover:text-indigo-500'}`}
      >
        {task.status === 'Done' ? <CheckCircle2 className={`${isSmall ? 'w-6 h-6' : 'w-8 h-8'}`} /> : <Circle className={`${isSmall ? 'w-6 h-6' : 'w-8 h-8'}`} />}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Link to={`/tasks/${task.id}`} className="group/title">
            <h4 className={`font-black truncate ${isSmall ? 'text-sm' : 'text-base'} ${task.status === 'Done' ? 'text-gray-400 line-through' : 'text-slate-800 dark:text-white group-hover/title:text-indigo-600 transition-colors'}`}>
              {task.task_name}
            </h4>
          </Link>
        </div>
        {!isSmall && task.task_description && (
          <p className="text-[11px] text-gray-400 mb-3 leading-relaxed font-medium line-clamp-2 italic">
            {task.task_description}
          </p>
        )}
        <div className="flex items-center gap-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
          <Link to={`/projects/${task.project_id}`} className="flex items-center gap-1 hover:text-indigo-600 transition-colors truncate max-w-[150px]">
            <Layers className="w-2.5 h-2.5" />
            {getProjectName(task.project_id)}
          </Link>
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" />
              {new Date(task.due_date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-shrink-0">
        {!isSmall && (
          <button 
            onClick={(e) => handleCalendarSync(e, task)}
            className="p-2.5 bg-indigo-50 dark:bg-slate-800 rounded-xl text-indigo-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 hover:text-white flex items-center justify-center"
            title="Add to Google Calendar"
          >
            <CalendarPlus className="w-4 h-4" />
          </button>
        )}

        <Link to={`/projects/${task.project_id}`} className={`bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center ${isSmall ? 'p-2' : 'p-3'}`}>
          <ExternalLink className={`${isSmall ? 'w-4 h-4' : 'w-5 h-5'}`} />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex-shrink-0">
            {currentUser?.avatar_url ? (
              <img src={currentUser.avatar_url} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUserName}`} className="w-full h-full" alt="Profile" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-slate-800 dark:text-white">My Workboard</h1>
              {isSyncing && <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />}
            </div>
            <p className="text-gray-500">Hello, <span className="text-indigo-600 font-black">{currentUserName}</span>. Here is your current queue.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 text-center">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Queue</p>
            <p className="text-xl font-black text-slate-800 dark:text-white">{pendingTasks.length}</p>
          </div>
          <div className="bg-indigo-600 px-6 py-3 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none text-center text-white">
            <p className="text-[9px] font-black text-indigo-100 uppercase tracking-widest mb-1">Load Factor</p>
            <p className="text-xl font-black">{pendingTasks.reduce((sum, t) => sum + (Number(t.scope_size) || 0), 0).toFixed(1)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
          <Clock className="w-4 h-4" /> Open Assignments
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {pendingTasks.length > 0 ? (
            pendingTasks.map(t => <TaskItem key={t.id} task={t} />)
          ) : (
            <div className="py-20 text-center bg-gray-50/50 dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-gray-200 dark:border-slate-800">
               <p className="text-gray-400 font-bold uppercase tracking-widest italic">No pending tasks. Refreshing...</p>
            </div>
          )}
        </div>
      </div>

      {completedTasks.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Recently Completed (5d Archiving)
            </h3>
            <span className="text-[9px] font-black text-gray-300 uppercase italic">Older tasks automatically hidden</span>
          </div>
          <div className="bg-gray-50/30 dark:bg-slate-900/30 p-4 rounded-[2.5rem] border border-gray-100 dark:border-slate-800">
            <div className="max-h-[460px] overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedTasks.map(t => <TaskItem key={t.id} task={t} isSmall={true} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
