
import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../lib/ProjectContext';
import { ArrowLeft, Calendar, Clock, CheckCircle2, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';
import { Task, Project } from '../types';

const ProjectGantt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, tasks, isSyncing } = useProjects();

  const project = projects.find((p) => String(p.id) === String(id));
  const projectTasks = tasks.filter((t) => String(t.project_id) === String(id));

  const sortedTasks = useMemo(() => {
    return [...projectTasks].sort((a, b) => {
      const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
      const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
      return dateA - dateB;
    });
  }, [projectTasks]);

  const timelineData = useMemo(() => {
    if (!project || sortedTasks.length === 0) return null;

    const allDates = [
      ...projectTasks.map(t => t.start_date).filter(Boolean).map(d => new Date(d!)),
      ...projectTasks.map(t => t.due_date).filter(Boolean).map(d => new Date(d!)),
      new Date(project.start_date),
      new Date(project.delivery_date)
    ];

    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    // Padding
    minDate.setDate(minDate.getDate() - 2);
    maxDate.setDate(maxDate.getDate() + 5);

    const diffTime = maxDate.getTime() - minDate.getTime();
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    return { minDate, maxDate, totalDays };
  }, [project, projectTasks, sortedTasks]);

  if (isSyncing && !project) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Syncing Timeline...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
        <AlertCircle className="w-16 h-16 text-rose-500" />
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Project Not Found</h2>
        <button onClick={() => navigate('/')} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Return to Hub</button>
      </div>
    );
  }

  const getPosition = (dateStr: string | undefined) => {
    if (!dateStr || !timelineData) return 0;
    const date = new Date(dateStr);
    const diff = date.getTime() - timelineData.minDate.getTime();
    return (diff / (1000 * 60 * 60 * 24)) / timelineData.totalDays * 100;
  };

  const getWidth = (startStr: string | undefined, endStr: string | undefined) => {
    if (!startStr || !endStr || !timelineData) return 0;
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diff = end.getTime() - start.getTime();
    return (diff / (1000 * 60 * 60 * 24)) / timelineData.totalDays * 100;
  };

  const statusColors = {
    'Pending': 'bg-slate-400',
    'In Progress': 'bg-indigo-500',
    'Done': 'bg-emerald-500'
  };

  const days = [];
  if (timelineData) {
    for (let i = 0; i < timelineData.totalDays; i++) {
      const d = new Date(timelineData.minDate);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:text-indigo-600 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{project.client_name}</span>
              <BarChart2 className="w-3 h-3 text-gray-300 rotate-90" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white leading-none tracking-tight">
              {project.project_name} <span className="text-gray-300 font-light ml-2">Timeline</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Operational Span</p>
             <p className="text-xs font-black text-slate-800 dark:text-white">
               {new Date(project.start_date).toLocaleDateString()} — {new Date(project.delivery_date).toLocaleDateString()}
             </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[1400px] p-10">
            {/* Timeline Header - Months & Days */}
            <div className="relative mb-10">
              <div className="flex h-16 border-b border-gray-100 dark:border-slate-800">
                <div className="w-64 flex-shrink-0 border-r border-gray-100 dark:border-slate-800 flex items-end pb-2 px-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Task Breakdown</span>
                </div>
                <div className="flex-1 relative flex">
                  {days.map((date, i) => {
                    const isFirstOfMonth = date.getDate() === 1;
                    const isMonday = date.getDay() === 1;
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    return (
                      <div 
                        key={i} 
                        className={`flex-1 border-l border-gray-50 dark:border-slate-800/50 flex flex-col items-center justify-end pb-2 ${isMonday ? 'bg-gray-50/30 dark:bg-slate-800/20' : ''} ${isToday ? 'bg-rose-50/50 dark:bg-rose-900/10' : ''}`}
                        style={{ width: `${100 / timelineData!.totalDays}%` }}
                      >
                        {isFirstOfMonth && (
                          <div className="absolute -top-8 left-0 pl-2">
                            <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] whitespace-nowrap bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
                              {date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        )}
                        <span className={`text-[8px] font-black uppercase mb-0.5 ${isToday ? 'text-rose-500' : 'text-gray-300'}`}>
                          {date.toLocaleDateString(undefined, { weekday: 'short' }).charAt(0)}
                        </span>
                        <span className={`text-[10px] font-black ${isToday ? 'text-rose-600' : 'text-slate-400'}`}>
                          {date.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Task Rows */}
            <div className="space-y-6 relative">
              {/* Today Vertical Line */}
              {timelineData && (
                <div 
                  className="absolute top-0 bottom-0 w-px bg-rose-500 z-10 opacity-30 pointer-events-none"
                  style={{ left: `calc(16rem + ${getPosition(new Date().toISOString())}%)` }}
                >
                  <div className="absolute -top-2 -left-1 w-2 h-2 bg-rose-500 rounded-full shadow-lg shadow-rose-200" />
                </div>
              )}

              {sortedTasks.map((task) => {
                const left = getPosition(task.start_date);
                const width = getWidth(task.start_date, task.due_date);
                
                return (
                  <div key={task.id} className="group flex items-center h-14">
                    <div className="w-64 flex-shrink-0 pr-6">
                      <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 transition-colors">
                        {task.task_name}
                      </h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                          {task.assigned_to}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusColors[task.status]}`} />
                      </div>
                    </div>
                    <div className="flex-1 h-full relative bg-gray-50/30 dark:bg-slate-800/20 rounded-2xl overflow-hidden border border-transparent group-hover:border-gray-100 dark:group-hover:border-slate-700 transition-all">
                      {task.start_date && task.due_date ? (
                        <div 
                          className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-xl shadow-sm transition-all group-hover:shadow-lg flex items-center px-4 border border-white/10 ${statusColors[task.status]}`}
                          style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                        >
                          <span className="text-[9px] font-black text-white uppercase tracking-widest truncate">
                            {task.status === 'Done' ? 'Completed' : `${task.status}`}
                          </span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[9px] font-black text-gray-200 dark:text-slate-700 uppercase tracking-widest italic">Timeline not defined</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {sortedTasks.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No tasks defined for this project timeline</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend Footer */}
        <div className="p-8 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex flex-wrap gap-10 items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-slate-400" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">In Progress</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Done</span>
          </div>
          <div className="h-4 w-px bg-gray-200 dark:bg-slate-700 mx-2" />
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectGantt;
