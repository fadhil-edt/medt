
import React, { useState } from 'react';
import { useProjects } from '../lib/ProjectContext';
import { UserRole, RolePermissions, Staff, AutomationSettings } from '../types';
import { ShieldAlert, CheckSquare, Square, Users, ShieldCheck, Mail, User, Zap, Clock, Bell, Info } from 'lucide-react';

const Roles: React.FC = () => {
  const { permissions, updatePermissions, staff, updateStaff, automationSettings, updateAutomationSettings } = useProjects();
  const [activeTab, setActiveTab] = useState<'permissions' | 'users' | 'automations'>('permissions');

  const handleToggle = (role: UserRole, module: keyof RolePermissions) => {
    if (role === 'Admin') return;
    const newPerms = { ...permissions[role], [module]: !permissions[role][module] };
    updatePermissions(role, newPerms);
  };

  const handleRoleChange = (memberId: string, newRole: UserRole) => {
    const member = staff.find(s => s.id === memberId);
    if (member && member.id !== 'sa-01') {
      updateStaff({ ...member, role_type: newRole });
    }
  };

  const handleAutomationToggle = (key: keyof AutomationSettings) => {
    updateAutomationSettings({
      ...automationSettings,
      [key]: !automationSettings[key]
    });
  };

  const modules: { id: keyof RolePermissions; label: string }[] = [
    { id: 'dashboard', label: 'Overview Dashboard' },
    { id: 'sales', label: 'Sales Pipeline / CRM' },
    { id: 'ongoing', label: 'Ongoing Projects / Ops' },
    { id: 'archive', label: 'Project Archive' },
    { id: 'team', label: 'Team Traffic Monitor' },
    { id: 'roles', label: 'Security & Role Management' },
    { id: 'viewFinancials', label: 'View Currency / Project Values' },
  ];

  const roleList: UserRole[] = ['Staff', 'Management', 'Admin'];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white">Access Control</h1>
        <p className="text-gray-500 mt-1">Configure system-wide module access, individual user ranks, and automated workflows.</p>
      </div>

      <div className="flex flex-wrap gap-4 p-1 bg-white dark:bg-slate-900 rounded-3xl w-fit shadow-sm border border-gray-100 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('permissions')}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'permissions' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-slate-800 dark:hover:text-white'}`}
        >
          <ShieldCheck className="w-4 h-4" /> Permissions
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-slate-800 dark:hover:text-white'}`}
        >
          <Users className="w-4 h-4" /> User Access
        </button>
        <button 
          onClick={() => setActiveTab('automations')}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'automations' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-slate-800 dark:hover:text-white'}`}
        >
          <Zap className="w-4 h-4" /> Automations
        </button>
      </div>

      {activeTab === 'permissions' ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/50">
                    <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest min-w-[250px]">System Module</th>
                    {roleList.map(r => (
                      <th key={r} className="px-6 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest min-w-[120px]">
                        {r}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {modules.map((mod) => (
                    <tr key={mod.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-10 py-6">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{mod.label}</span>
                      </td>
                      {roleList.map(r => (
                        <td key={r} className="px-6 py-6 text-center">
                          {r === 'Admin' ? (
                            <div className="flex justify-center"><ShieldAlert className="w-6 h-6 text-indigo-200" /></div>
                          ) : (
                            <button onClick={() => handleToggle(r, mod.id)} className={`transition-all transform active:scale-90 ${r === 'Staff' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                              {permissions[r][mod.id] ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6 text-gray-200 dark:text-slate-700" />}
                            </button>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-8 rounded-[2rem] flex items-start gap-6">
            <div className="p-3 bg-amber-200 dark:bg-amber-800 rounded-2xl"><ShieldAlert className="w-6 h-6 text-amber-700 dark:text-amber-200" /></div>
            <div>
               <h4 className="text-sm font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider mb-2">Security Notice</h4>
               <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">Admin roles possess irrevocable access to all modules. Any changes made to other roles will apply immediately system-wide.</p>
            </div>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/50">
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Team Member</th>
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">Work Email</th>
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800 text-center">Access Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 dark:text-white">{member.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{member.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                        <Mail className="w-4 h-4 text-gray-300" />
                        {member.email}
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex justify-center">
                        <select 
                          disabled={member.id === 'sa-01'}
                          value={member.role_type}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] appearance-none transition-all outline-none text-center border-2 ${
                            member.id === 'sa-01' ? 'bg-indigo-50/50 border-indigo-100/50 text-indigo-400 cursor-not-allowed opacity-70' : 
                            member.role_type === 'Admin' ? 'bg-indigo-50 border-indigo-100 text-indigo-600 cursor-pointer' : 
                            member.role_type === 'Management' ? 'bg-emerald-50 border-emerald-100 text-emerald-600 cursor-pointer' :
                            'bg-gray-50 border-gray-100 text-gray-500 cursor-pointer'
                          }`}
                        >
                          {roleList.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-sm border border-gray-100 dark:border-slate-800 space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest leading-none">Task Assignment</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Direct Workboard Notification</p>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
              Automatically trigger an email notification to the assignee whenever a new task is created or re-assigned to them.
            </p>

            <button 
              onClick={() => handleAutomationToggle('emailOnAssignment')}
              className={`w-full flex items-center justify-between p-6 rounded-[2rem] border transition-all ${automationSettings.emailOnAssignment ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-inner' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-400'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">Email Notifications</span>
              {automationSettings.emailOnAssignment ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-sm border border-gray-100 dark:border-slate-800 space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-2xl text-rose-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest leading-none">Deadline Pulse</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Daily Due Date Reminders</p>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
              Sends a reminder digest at 10:00 AM every day for tasks due today, ensuring zero misses on delivery dates.
            </p>

            <button 
              onClick={() => handleAutomationToggle('dailyDueReminders')}
              className={`w-full flex items-center justify-between p-6 rounded-[2rem] border transition-all ${automationSettings.dailyDueReminders ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-inner' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-400'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">10AM Daily Sync</span>
              {automationSettings.dailyDueReminders ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
            </button>
          </div>

          <div className="col-span-full bg-indigo-600 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-indigo-100 dark:shadow-none">
            <div className="p-4 bg-white/10 rounded-[2rem]">
              <Info className="w-8 h-8" />
            </div>
            <div className="flex-1 text-center md:text-left">
               <h4 className="text-lg font-black uppercase tracking-widest mb-1">Cloud Automation Active</h4>
               <p className="text-xs font-bold text-indigo-100 leading-relaxed">
                 These automations rely on the Google Apps Script backend. Ensure your script includes the <code>sendAssignmentEmail</code> and <code>dailyReminders</code> triggers to process these events from the Workspace Cloud.
               </p>
            </div>
            <button className="px-8 py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all active:scale-95">
               View API Docs
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
