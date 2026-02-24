
import React, { useState, useMemo } from 'react';
import { useProjects } from '../lib/ProjectContext';
import { Staff, UserRole } from '../types';
import { User, X, Edit3, UserPlus, Mail, Key, Eye, EyeOff, LayoutGrid, Table as TableIcon, Check, ChevronDown, ShieldAlert, Kanban, ArrowRight, Briefcase, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Team: React.FC = () => {
  const { staff, tasks, projects, addStaff, updateStaff } = useProjects();
  const navigate = useNavigate();
  const [view, setView] = useState<'card' | 'table' | 'workload'>('card');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<Partial<Staff>>({ 
    name: '', 
    email: '', 
    role: '', 
    role_type: 'Staff', 
    password: '', 
    weekly_capacity: 5.0,
    gender: 'Other'
  });
  const [showPassword, setShowPassword] = useState(false);

  const generateAvatar = (name: string, gender?: string) => {
    const seed = Math.random().toString(36).substring(7);
    let style = 'notionists';
    let params = '';
    
    if (gender === 'Male') {
      style = 'avataaars';
      params = '&top=shortHair,shortCurly,shortFlat,shortRound,shortWaved,sides,theCaesar';
    } else if (gender === 'Female') {
      style = 'avataaars';
      params = '&top=longHair,bigHair,bob,curly,curvy,dreads,frida,frizzle';
    }
    
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}${params}`;
  };

  const handleRegenerateAvatar = () => {
    const newAvatar = generateAvatar(formData.name || 'user', formData.gender);
    setFormData({ ...formData, avatar_url: newAvatar });
  };

  const staffWithStats = useMemo(() => staff.map(member => ({ 
    ...member, 
    current_load: tasks.filter(t => t.assigned_to === member.name && t.status !== 'Done').reduce((sum, t) => sum + (Number(t.scope_size) || 0), 0) 
  })), [staff, tasks]);

  const projectWorkloads = useMemo(() => {
    const activeProjects = projects.filter(p => !['Completed', 'Lost'].includes(p.status));
    
    const mapped = activeProjects.map(project => {
      const projectTasks = tasks.filter(t => String(t.project_id) === String(project.id));
      const uniqueAssignees = Array.from(new Set(projectTasks.map(t => t.assigned_to?.trim().toLowerCase()).filter(Boolean)));
      
      const involvedMembers = uniqueAssignees.map(assigneeName => {
        const staffMember = staff.find(s => s.name.trim().toLowerCase() === assigneeName);
        const remainingTasks = projectTasks.filter(t => t.assigned_to?.trim().toLowerCase() === assigneeName && t.status !== 'Done').length;
        
        return {
          staffMember,
          name: assigneeName,
          remainingTasks
        };
      }).filter(item => item.staffMember !== undefined);

      return {
        project,
        involvedMembers,
        totalRemainingTasks: involvedMembers.reduce((sum, m) => sum + m.remainingTasks, 0)
      };
    }).filter(pw => pw.involvedMembers.length > 0);

    const hot = mapped.filter(pw => pw.project.status === 'Hot').sort((a, b) => b.totalRemainingTasks - a.totalRemainingTasks);
    const warm = mapped.filter(pw => pw.project.status === 'Warm').sort((a, b) => b.totalRemainingTasks - a.totalRemainingTasks);
    const cold = mapped.filter(pw => pw.project.status === 'Cold').sort((a, b) => b.totalRemainingTasks - a.totalRemainingTasks);
    const ongoing = mapped.filter(pw => ['Pre Prod', 'Development', 'Closure'].includes(pw.project.status)).sort((a, b) => b.totalRemainingTasks - a.totalRemainingTasks);

    return { hot, warm, cold, ongoing };
  }, [projects, tasks, staff]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData };
    if (!finalData.avatar_url) {
      finalData.avatar_url = generateAvatar(finalData.name || 'user', finalData.gender);
    }
    
    if (editingMember) updateStaff({ ...editingMember, ...finalData } as Staff);
    else addStaff({ id: Math.random().toString(36).substr(2, 9), ...finalData, active_tasks: 0 } as Staff);
    setIsModalOpen(false);
  };

  const handleInlineEdit = (id: string, field: keyof Staff, value: any) => {
    const member = staff.find(s => s.id === id);
    if (member && member.id !== 'sa-01') {
      updateStaff({ ...member, [field]: value });
    }
  };

  const roleOptions: UserRole[] = ['Staff', 'Management', 'Admin'];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white">Team Traffic</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage users, access roles and monitor individual capacity.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl flex items-center shadow-sm border border-gray-100 dark:border-slate-800">
            <button 
              onClick={() => setView('card')} 
              className={`p-2 rounded-xl transition-all ${view === 'card' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-indigo-600'}`}
              title="Card View"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setView('table')} 
              className={`p-2 rounded-xl transition-all ${view === 'table' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-indigo-600'}`}
              title="Table View"
            >
              <TableIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setView('workload')} 
              className={`p-2 rounded-xl transition-all ${view === 'workload' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-indigo-600'}`}
              title="Team Current Workload"
            >
              <Briefcase className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => { setEditingMember(null); setFormData({ name: '', email: '', role: '', role_type: 'Staff', password: '', weekly_capacity: 5.0 }); setShowPassword(false); setIsModalOpen(true); }} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full text-sm font-black flex items-center shadow-lg transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Add Team Member
          </button>
        </div>
      </div>

      {view === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
          {staffWithStats.map((member) => (
            <div key={member.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-slate-800 group hover:shadow-xl transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                 <div className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                   member.role_type === 'Admin' ? 'bg-indigo-100 text-indigo-600' : 
                   member.role_type === 'Management' ? 'bg-emerald-100 text-emerald-600' : 
                   'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
                 }`}>{member.role_type}</div>
                 <div className="flex items-center gap-1">
                   {member.id !== 'sa-01' && (
                     <button onClick={() => { setEditingMember(member); setFormData(member); setIsModalOpen(true); setShowPassword(false); }} className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-300 hover:text-indigo-600 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Edit3 className="w-4 h-4" /></button>
                   )}
                   {member.id === 'sa-01' && (
                     <div className="p-2 text-indigo-200" title="System Protected Account"><ShieldAlert className="w-4 h-4" /></div>
                   )}
                 </div>
              </div>
              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-gray-400 mb-4 shadow-inner overflow-hidden border border-gray-100 dark:border-slate-700">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} className="w-full h-full object-cover" alt={member.name} />
                  ) : (
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${member.name}`} className="w-full h-full" alt={member.name} />
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white">{member.name}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 mb-4">{member.role}</p>
                <div className="w-full bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 mb-4">
                  <div className="flex justify-between items-end mb-2"><p className="text-[9px] uppercase font-black text-gray-400">Load Factor</p><p className="text-xs font-black dark:text-white">{(Number(member.current_load) || 0).toFixed(1)} / {(Number(member.weekly_capacity) || 0).toFixed(1)}</p></div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden shadow-inner"><div className={`h-full transition-all duration-700 ${(Number(member.current_load) || 0) > (Number(member.weekly_capacity) || 0) ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(((Number(member.current_load) || 0) / (Number(member.weekly_capacity) || 1)) * 100, 100)}%` }} /></div>
                </div>
              </div>
              <button 
                onClick={() => navigate(`/team/${member.id}/workload`)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
              >
                <Kanban className="w-3.5 h-3.5" />
                View Workload Map
              </button>
            </div>
          ))}
        </div>
      ) : view === 'table' ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/50">
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Name</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Role</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Level</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Weekly Capacity</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800 text-center">Load</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {staffWithStats.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100">
                           <img src={member.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${member.name}`} className="w-full h-full object-cover" />
                         </div>
                         <input 
                          disabled={member.id === 'sa-01'}
                          className={`bg-transparent border-0 focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1 font-bold text-slate-800 dark:text-slate-100 transition-all outline-none ${member.id === 'sa-01' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          value={member.name}
                          onChange={(e) => handleInlineEdit(member.id, 'name', e.target.value)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        disabled={member.id === 'sa-01'}
                        className={`w-full bg-transparent border-0 focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1 font-medium text-slate-600 dark:text-slate-300 transition-all outline-none ${member.id === 'sa-01' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        value={member.role}
                        onChange={(e) => handleInlineEdit(member.id, 'role', e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        disabled={member.id === 'sa-01'}
                        className={`w-full bg-transparent border-0 focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1 font-black text-[9px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 transition-all outline-none appearance-none ${member.id === 'sa-01' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        value={member.role_type}
                        onChange={(e) => handleInlineEdit(member.id, 'role_type', e.target.value as UserRole)}
                      >
                        {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        disabled={member.id === 'sa-01'}
                        type="number"
                        step="0.5"
                        className={`w-20 bg-transparent border-0 focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1 font-black text-center text-slate-800 dark:text-slate-100 transition-all outline-none ${member.id === 'sa-01' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        value={member.weekly_capacity}
                        onChange={(e) => handleInlineEdit(member.id, 'weekly_capacity', Number(e.target.value))}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                          <div className={`h-full ${(Number(member.current_load) || 0) > (Number(member.weekly_capacity) || 0) ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(((Number(member.current_load) || 0) / (Number(member.weekly_capacity) || 1)) * 100, 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-gray-500">{(Number(member.current_load) || 0).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => navigate(`/team/${member.id}/workload`)}
                         className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                         title="View Workload"
                       >
                         <ArrowRight className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Changes are saved automatically to the cloud context</p>
          </div>
        </div>
      ) : (
        <div className="space-y-12 animate-in fade-in duration-500">
          {/* Ongoing Projects Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 px-2">
              <div className="h-8 w-1.5 bg-indigo-600 rounded-full" />
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Ongoing Projects</h2>
              <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/50">
                {projectWorkloads.ongoing.length} Active
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {projectWorkloads.ongoing.map(({ project, involvedMembers, totalRemainingTasks }) => (
                <div key={project.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col">
                  <div className="p-7 border-b border-gray-50 dark:border-slate-800/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center font-black text-lg text-indigo-600 shadow-inner">
                          {project.client_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight truncate max-w-[180px]">{project.project_name}</h3>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{project.client_name}</p>
                        </div>
                      </div>
                      <Link to={`/projects/${project.id}`} className="p-2.5 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-indigo-600 rounded-xl transition-all border border-gray-100 dark:border-slate-700">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black bg-rose-50 dark:bg-rose-900/20 text-rose-600 px-3 py-1 rounded-full uppercase tracking-widest border border-rose-100 dark:border-rose-900/50">
                        {totalRemainingTasks} Remaining Tasks
                      </span>
                      <span className="text-[8px] font-black bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/50">
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-7 space-y-4 flex-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Involved Personnel</p>
                    <div className="space-y-3">
                      {involvedMembers.map((item, idx) => (
                        <Link 
                          key={idx} 
                          to={`/team/${item.staffMember?.id}/workload`}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700">
                              <img src={item.staffMember?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${item.name}`} className="w-full h-full object-cover" alt={item.name} />
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 leading-none">{item.staffMember?.name}</p>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.staffMember?.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-black ${item.remainingTasks > 0 ? 'text-indigo-600' : 'text-emerald-500'}`}>
                              {item.remainingTasks}
                            </p>
                            <p className="text-[7px] font-black text-gray-400 uppercase tracking-tighter">Remaining</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {projectWorkloads.ongoing.length === 0 && (
                <div className="col-span-full py-20 text-center bg-gray-50/50 dark:bg-slate-900/30 rounded-[4rem] border-2 border-dashed border-gray-200 dark:border-slate-800">
                  <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">No Active Ongoing Projects</p>
                </div>
              )}
            </div>
          </section>

          {/* Hot Leads Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 px-2">
              <div className="h-8 w-1.5 bg-rose-500 rounded-full" />
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Hot Leads</h2>
              <span className="text-[10px] font-black bg-rose-50 dark:bg-rose-900/20 text-rose-600 px-3 py-1 rounded-full border border-rose-100 dark:border-rose-900/50">
                {projectWorkloads.hot.length} Active
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {projectWorkloads.hot.map(({ project, involvedMembers, totalRemainingTasks }) => (
                <div key={project.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col">
                  <div className="p-7 border-b border-gray-50 dark:border-slate-800/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center font-black text-lg text-rose-600 shadow-inner">
                          {project.client_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight truncate max-w-[180px]">{project.project_name}</h3>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{project.client_name}</p>
                        </div>
                      </div>
                      <Link to={`/projects/${project.id}`} className="p-2.5 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-indigo-600 rounded-xl transition-all border border-gray-100 dark:border-slate-700">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black bg-rose-50 dark:bg-rose-900/20 text-rose-600 px-3 py-1 rounded-full uppercase tracking-widest border border-rose-100 dark:border-rose-900/50">
                        {totalRemainingTasks} Remaining Tasks
                      </span>
                      <span className="text-[8px] font-black bg-rose-50 dark:bg-rose-900/20 text-rose-600 px-3 py-1 rounded-full uppercase tracking-widest border border-rose-100 dark:border-rose-900/50">
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-7 space-y-4 flex-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Involved Personnel</p>
                    <div className="space-y-3">
                      {involvedMembers.map((item, idx) => (
                        <Link 
                          key={idx} 
                          to={`/team/${item.staffMember?.id}/workload`}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700">
                              <img src={item.staffMember?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${item.name}`} className="w-full h-full object-cover" alt={item.name} />
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 leading-none">{item.staffMember?.name}</p>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.staffMember?.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-black ${item.remainingTasks > 0 ? 'text-indigo-600' : 'text-emerald-500'}`}>
                              {item.remainingTasks}
                            </p>
                            <p className="text-[7px] font-black text-gray-400 uppercase tracking-tighter">Remaining</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {projectWorkloads.hot.length === 0 && (
                <div className="col-span-full py-20 text-center bg-gray-50/50 dark:bg-slate-900/30 rounded-[4rem] border-2 border-dashed border-gray-200 dark:border-slate-800">
                  <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">No Active Hot Leads</p>
                </div>
              )}
            </div>
          </section>

          {/* Warm Leads Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 px-2">
              <div className="h-8 w-1.5 bg-amber-500 rounded-full" />
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Warm Leads</h2>
              <span className="text-[10px] font-black bg-amber-50 dark:bg-amber-900/20 text-amber-600 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-900/50">
                {projectWorkloads.warm.length} Active
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {projectWorkloads.warm.map(({ project, involvedMembers, totalRemainingTasks }) => (
                <div key={project.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col">
                  <div className="p-7 border-b border-gray-50 dark:border-slate-800/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center font-black text-lg text-amber-600 shadow-inner">
                          {project.client_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight truncate max-w-[180px]">{project.project_name}</h3>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{project.client_name}</p>
                        </div>
                      </div>
                      <Link to={`/projects/${project.id}`} className="p-2.5 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-indigo-600 rounded-xl transition-all border border-gray-100 dark:border-slate-700">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black bg-rose-50 dark:bg-rose-900/20 text-rose-600 px-3 py-1 rounded-full uppercase tracking-widest border border-rose-100 dark:border-rose-900/50">
                        {totalRemainingTasks} Remaining Tasks
                      </span>
                      <span className="text-[8px] font-black bg-amber-50 dark:bg-amber-900/20 text-amber-600 px-3 py-1 rounded-full uppercase tracking-widest border border-amber-100 dark:border-amber-900/50">
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-7 space-y-4 flex-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Involved Personnel</p>
                    <div className="space-y-3">
                      {involvedMembers.map((item, idx) => (
                        <Link 
                          key={idx} 
                          to={`/team/${item.staffMember?.id}/workload`}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700">
                              <img src={item.staffMember?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${item.name}`} className="w-full h-full object-cover" alt={item.name} />
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 leading-none">{item.staffMember?.name}</p>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.staffMember?.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-black ${item.remainingTasks > 0 ? 'text-indigo-600' : 'text-emerald-500'}`}>
                              {item.remainingTasks}
                            </p>
                            <p className="text-[7px] font-black text-gray-400 uppercase tracking-tighter">Remaining</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {projectWorkloads.warm.length === 0 && (
                <div className="col-span-full py-20 text-center bg-gray-50/50 dark:bg-slate-900/30 rounded-[4rem] border-2 border-dashed border-gray-200 dark:border-slate-800">
                  <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">No Active Warm Leads</p>
                </div>
              )}
            </div>
          </section>

          {/* Cold Leads Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 px-2">
              <div className="h-8 w-1.5 bg-slate-400 rounded-full" />
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Cold Leads</h2>
              <span className="text-[10px] font-black bg-slate-50 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
                {projectWorkloads.cold.length} Leads
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {projectWorkloads.cold.map(({ project, involvedMembers, totalRemainingTasks }) => (
                <div key={project.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col opacity-75 grayscale-[0.5]">
                  <div className="p-7 border-b border-gray-50 dark:border-slate-800/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-lg text-slate-400 shadow-inner">
                          {project.client_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight truncate max-w-[180px]">{project.project_name}</h3>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{project.client_name}</p>
                        </div>
                      </div>
                      <Link to={`/projects/${project.id}`} className="p-2.5 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-indigo-600 rounded-xl transition-all border border-gray-100 dark:border-slate-700">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black bg-slate-50 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-100 dark:border-slate-700">
                        {totalRemainingTasks} Remaining Tasks
                      </span>
                      <span className="text-[8px] font-black bg-slate-50 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-100 dark:border-slate-700">
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-7 space-y-4 flex-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Involved Personnel</p>
                    <div className="space-y-3">
                      {involvedMembers.map((item, idx) => (
                        <Link 
                          key={idx} 
                          to={`/team/${item.staffMember?.id}/workload`}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700">
                              <img src={item.staffMember?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${item.name}`} className="w-full h-full object-cover" alt={item.name} />
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 leading-none">{item.staffMember?.name}</p>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.staffMember?.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-black ${item.remainingTasks > 0 ? 'text-indigo-600' : 'text-emerald-500'}`}>
                              {item.remainingTasks}
                            </p>
                            <p className="text-[7px] font-black text-gray-400 uppercase tracking-tighter">Remaining</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {projectWorkloads.cold.length === 0 && (
                <div className="col-span-full py-20 text-center bg-gray-50/50 dark:bg-slate-900/30 rounded-[4rem] border-2 border-dashed border-gray-200 dark:border-slate-800">
                  <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">No Active Cold Leads</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-md shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">{editingMember ? 'Edit User' : 'New User'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-gray-400 shadow-inner overflow-hidden border-2 border-dashed border-gray-200 dark:border-slate-700 group-hover:border-indigo-500 transition-all">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <User className="w-10 h-10 opacity-20" />
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={handleRegenerateAvatar}
                    className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-90"
                    title="Regenerate Avatar"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-4">Profile Identity</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input required className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-slate-800 dark:text-white font-bold transition-all" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest">Gender</label>
                  <select 
                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-slate-800 dark:text-white font-bold transition-all appearance-none cursor-pointer" 
                    value={formData.gender || 'Other'} 
                    onChange={e => {
                      const newGender = e.target.value as any;
                      const newAvatar = generateAvatar(formData.name || 'user', newGender);
                      setFormData({...formData, gender: newGender, avatar_url: newAvatar});
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest">User Level</label>
                  <select className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-slate-800 dark:text-white font-bold transition-all appearance-none cursor-pointer" value={formData.role_type} onChange={e => setFormData({...formData, role_type: e.target.value as UserRole})}>
                    {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input required type="email" className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-slate-800 dark:text-white font-bold transition-all" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest">Role Title</label>
                <input required className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-slate-800 dark:text-white font-bold transition-all" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest">Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-slate-800 dark:text-white font-bold transition-all" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-indigo-500">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div><label className="text-[10px] font-black text-gray-400 uppercase block mb-2 tracking-widest">Weekly Capacity (Units)</label><input type="number" step="0.5" className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-slate-800 dark:text-white font-bold transition-all" value={formData.weekly_capacity || ''} onChange={e => setFormData({...formData, weekly_capacity: Number(e.target.value)})} /></div>
              <div className="pt-6 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-black uppercase text-gray-400 hover:text-slate-800 dark:hover:text-white">Cancel</button>
                <button type="submit" className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95">Confirm Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
