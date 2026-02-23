
import React from 'react';
import { useProjects } from '../lib/ProjectContext';
import { Bell, CheckCircle2, UserPlus, Clock, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Notifications: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, projects, tasks } = useProjects();

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now.getTime() - then.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getTaskLink = (notification: any) => {
    if (notification.relatedId) {
      const task = tasks.find(t => String(t.id) === String(notification.relatedId));
      if (task) return `/projects/${task.project_id}`;
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white">Workspace Alerts</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Updates on assignments and deadlines.</p>
        </div>
        <button 
          onClick={markAllNotificationsRead}
          className="bg-white dark:bg-slate-900 px-6 py-2.5 rounded-full border border-gray-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" /> Mark All as Read
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const taskLink = getTaskLink(notif);
            return (
              <div 
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`group bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border transition-all flex items-center gap-6 cursor-pointer hover:shadow-md ${notif.isRead ? 'opacity-70 border-gray-50 dark:border-slate-800' : 'border-indigo-100 dark:border-indigo-900/50 ring-1 ring-indigo-50/50'}`}
              >
                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                  notif.type === 'TaskAssignment' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500' : 
                  notif.type === 'DueDateReminder' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' : 
                  'bg-gray-50 text-gray-500'
                }`}>
                  {notif.type === 'TaskAssignment' ? <UserPlus className="w-6 h-6" /> : 
                   notif.type === 'DueDateReminder' ? <Clock className="w-6 h-6" /> : 
                   <Bell className="w-6 h-6" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`text-base font-black truncate ${notif.isRead ? 'text-slate-600' : 'text-slate-800 dark:text-white'}`}>
                      {notif.title}
                    </h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 font-medium line-clamp-1">{notif.message}</p>
                </div>

                <div className="flex items-center gap-6 text-right">
                   <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest whitespace-nowrap">
                     {getRelativeTime(notif.timestamp)}
                   </span>
                   {taskLink && (
                     <Link 
                       to={taskLink}
                       className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
                     >
                        <ExternalLink className="w-5 h-5" />
                     </Link>
                   )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-32 text-center bg-gray-50/50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-slate-800">
             <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Bell className="w-10 h-10 text-gray-200" />
             </div>
             <p className="text-gray-400 font-bold uppercase tracking-widest italic">All clear. No new notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
