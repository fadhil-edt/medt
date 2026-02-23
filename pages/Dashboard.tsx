
import React, { useMemo, useState, useEffect } from 'react';
import { useProjects } from '../lib/ProjectContext';
import { ArrowUpRight, PieChart, TrendingUp, Clock, Briefcase as BriefcaseIcon, Lock, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Wallet, CreditCard, Activity, ChevronDown, ListFilter, X, User } from 'lucide-react';
import { Project } from '../types';
import { Link } from 'react-router-dom';

const DashboardCalendar: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const [currentDate, setcurrentDate] = useState(new Date());
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setcurrentDate(new Date(year, month - 1));
  const nextMonth = () => setcurrentDate(new Date(year, month + 1));

  const totalDays = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month);
  
  const days = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  const getProjectsForDay = (day: number) => {
    if (!day) return [];
    const checkDate = new Date(year, month, day);
    checkDate.setHours(0, 0, 0, 0);

    return projects.filter(p => {
      const kickoff = new Date(p.kickoff_date);
      const delivery = new Date(p.delivery_date);
      kickoff.setHours(0, 0, 0, 0);
      delivery.setHours(0, 0, 0, 0);
      
      const inRange = checkDate >= kickoff && checkDate <= delivery;
      const cur = checkDate.getTime();
      
      const hasEvent = p.has_event && (
        (p.event_start_date && new Date(p.event_start_date).setHours(0,0,0,0) === cur) ||
        (p.event_end_date && new Date(p.event_end_date).setHours(0,0,0,0) === cur)
      );

      return inRange || hasEvent;
    }).map(p => {
        const kickoff = new Date(p.kickoff_date).setHours(0,0,0,0);
        const delivery = new Date(p.delivery_date).setHours(0,0,0,0);
        const cur = checkDate.getTime();
        
        let type: 'kickoff' | 'delivery' | 'span' | 'event' = 'span';
        if (cur === kickoff) type = 'kickoff';
        else if (cur === delivery) type = 'delivery';

        const isEventDay = p.has_event && (
            (p.event_start_date && new Date(p.event_start_date).setHours(0,0,0,0) === cur) ||
            (p.event_end_date && new Date(p.event_end_date).setHours(0,0,0,0) === cur)
        );
        if (isEventDay) type = 'event';

        return { ...p, calendarType: type };
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800">
       <div className="flex justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs">Production Timeline</h3>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-sm font-black text-slate-600 dark:text-slate-300">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
             </span>
             <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all"><ChevronLeft className="w-4 h-4 text-gray-400"/></button>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all"><ChevronRight className="w-4 h-4 text-gray-400"/></button>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-7 gap-2 mb-2">
          {['S','M','T','W','T','F','S'].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest py-2">{d}</div>
          ))}
       </div>

       <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const activeProjects = day ? getProjectsForDay(day) : [];
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            return (
              <div key={idx} className={`min-h-[120px] p-2 rounded-2xl border transition-all ${day ? 'bg-white dark:bg-slate-950/30 border-gray-50 dark:border-slate-800' : 'bg-transparent border-transparent'} ${isToday ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}>
                {day && (
                  <>
                    <span className={`text-xs font-black ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>{day}</span>
                    <div className="mt-2 space-y-1 overflow-hidden">
                       {activeProjects.slice(0, 3).map((p, i) => (
                         <Link key={p.id + i} to={`/projects/${p.id}`} className={`block text-[8px] font-black uppercase px-2 py-1 rounded-md truncate leading-tight border transition-all hover:scale-[1.03] active:scale-95 ${
                           p.calendarType === 'kickoff' ? 'bg-indigo-500 text-white border-indigo-600' : 
                           p.calendarType === 'delivery' ? 'bg-emerald-500 text-white border-emerald-600' :
                           p.calendarType === 'event' ? 'bg-rose-500 text-white border-rose-600' :
                           'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50'
                         }`}>
                            {p.project_name}
                         </Link>
                       ))}
                       {activeProjects.length > 3 && (
                         <div className="text-[6px] font-black text-gray-400 text-center">+{activeProjects.length - 3}</div>
                       )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
       </div>
    </div>
  );
};

const StatCarousel: React.FC<{ projects: Project[], emptyText: string, label: string }> = ({ projects, emptyText, label }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (projects.length <= 1) return;
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % projects.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [projects.length]);

  if (projects.length === 0) {
    return (
      <div className="mt-6 pt-6 border-t border-gray-50 dark:border-slate-800/50 flex flex-col items-center justify-center">
        <p className="text-[10px] font-black text-gray-300 uppercase italic tracking-widest">{emptyText}</p>
      </div>
    );
  }

  const p = projects[index];

  return (
    <div className="mt-6 pt-6 border-t border-gray-50 dark:border-slate-800/50 group/carousel">
      <Link to={`/projects/${p.id}`} className="block group/item">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-lg font-black text-slate-800 dark:text-white truncate leading-tight transition-all group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400">
              {p.project_name}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.client_name}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 bg-gray-50 dark:bg-slate-800/50 p-2 px-3 rounded-2xl border border-gray-100 dark:border-slate-800 transition-all group-hover/item:border-indigo-200 dark:group-hover/item:border-indigo-800">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">Progress</p>
            <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">{p.progress}%</p>
          </div>
        </div>
      </Link>
      
      <div className="flex gap-2 mt-6">
        {projects.map((_, i) => (
          <div key={i} className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
            {i === index && <div className="absolute inset-0 bg-indigo-500 rounded-full animate-progress-bar" />}
            {i < index && <div className="absolute inset-0 bg-indigo-300 dark:bg-indigo-700/50 rounded-full" />}
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { projects, tasks, staff, currentUserRole, permissions } = useProjects();
  const canSeeMoney = permissions[currentUserRole].viewFinancials;

  const stats = useMemo(() => {
    const ongoingList = projects.filter((p) => ['Pre Prod', 'Development', 'Closure'].includes(p.status));
    const hotLeadsList = projects.filter((p) => p.status === 'Hot');
    const completedList = projects.filter(p => p.status === 'Completed');
    
    const activeProjectsValue = ongoingList.reduce((acc, curr) => acc + (curr.project_type === 'Servicing' ? curr.budget : 0), 0);
    const totalCompletedValue = completedList.reduce((acc, curr) => acc + (curr.project_type === 'Servicing' ? curr.budget : 0), 0);
    
    let totalClaimed = 0;
    projects.forEach(p => {
      if (p.project_type === 'Servicing') {
        p.claims?.forEach(m => {
          if (m.isClaimed) totalClaimed += (p.budget * (m.percentage / 100));
        });
      }
    });

    const staffLoad = staff.map(member => {
      const load = tasks
        .filter(t => t.assigned_to === member.name && t.status !== 'Done')
        .reduce((sum, t) => sum + (Number(t.scope_size) || 0), 0);
      return { 
        name: member.name, 
        load, 
        capacity: Number(member.weekly_capacity) || 0,
        avatar_url: member.avatar_url
      };
    }).sort((a, b) => {
      const aPercent = a.capacity > 0 ? a.load / a.capacity : 0;
      const bPercent = b.capacity > 0 ? b.load / b.capacity : 0;
      return bPercent - aPercent;
    });

    return { 
      activeProjectsValue, 
      totalCompletedValue,
      totalClaimed, 
      ongoingList, 
      hotLeadsList, 
      staffLoad
    };
  }, [projects, tasks, staff]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white">EDT Command Center</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Real-time Operations Pulse</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-2.5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Systems Nominal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Big Stats */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-[#1061C3] to-[#084A9A] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200 dark:shadow-none relative overflow-hidden group">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-xs font-black text-blue-100 uppercase tracking-[0.2em] mb-2">Total Project Value Completed for 2026</p>
                {canSeeMoney ? (
                  <h3 className="text-5xl font-black">RM {(stats.totalCompletedValue / 1000).toFixed(1)}k</h3>
                ) : (
                  <div className="flex items-center gap-2 text-blue-200">
                    <Lock className="w-8 h-8 opacity-40" />
                    <span className="text-3xl font-black italic tracking-widest opacity-40">RESTRICTED</span>
                  </div>
                )}
              </div>
              <div className="bg-emerald-400/20 text-emerald-300 px-5 py-2 rounded-full text-xs font-black flex items-center gap-2 border border-emerald-400/20">
                <TrendingUp className="w-4 h-4" />
                Active Pipeline
              </div>
            </div>
            
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <Activity className="w-64 h-64" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800 group hover:shadow-lg transition-all flex flex-col justify-between h-64">
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-500">
                      <BriefcaseIcon className="w-5 h-5" />
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-slate-800 dark:text-white">{stats.ongoingList.length}</h4>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Live Projects</p>
                   </div>
                </div>
                <div className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Active</div>
             </div>
             <StatCarousel projects={stats.ongoingList} emptyText="No live projects in delivery" label="Project Active" />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800 group hover:shadow-lg transition-all flex flex-col justify-between h-64">
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center text-rose-500">
                      <TrendingUp className="w-5 h-5" />
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-slate-800 dark:text-white">{stats.hotLeadsList.length}</h4>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Hot Leads</p>
                   </div>
                </div>
                <div className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Pipeline</div>
             </div>
             <StatCarousel projects={stats.hotLeadsList} emptyText="No hot leads in funnel" label="Lead Active" />
          </div>
        </div>

        {/* Right Column: Team Traffic */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col min-h-[600px]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs">Team Traffic Monitor</h3>
            <span className="text-[10px] bg-indigo-600 text-white px-3 py-1 rounded-full font-black tracking-widest uppercase">Live Load</span>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto scrollbar-hide">
            {stats.staffLoad.map((s, idx) => {
              const loadPercent = s.capacity > 0 ? Math.min((s.load / s.capacity) * 100, 100) : 0;
              const isOverloaded = s.capacity > 0 && s.load > s.capacity;
              
              return (
                <div key={idx} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-slate-800 overflow-hidden border border-gray-100 dark:border-slate-700">
                        {s.avatar_url ? (
                          <img src={s.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                        ) : (
                          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${s.name}`} className="w-full h-full" alt="avatar" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 dark:text-white">{s.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">{isOverloaded ? 'Over Capacity' : 'Available'}</p>
                      </div>
                    </div>
                    <p className={`text-xs font-black ${isOverloaded ? 'text-rose-500' : 'text-indigo-600'}`}>{s.load.toFixed(1)}u</p>
                  </div>
                  <div className="w-full h-1.5 bg-gray-50 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${isOverloaded ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]'}`} 
                      style={{ width: `${loadPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <Link to="/team" className="mt-8 flex items-center justify-center gap-2 py-4 bg-gray-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all">
             View Full Traffic Map
          </Link>
        </div>
      </div>

      {/* Row 2: Timeline */}
      <div className="w-full">
         <DashboardCalendar projects={stats.ongoingList} />
      </div>
    </div>
  );
};

export default Dashboard;
