
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Target, Briefcase, Users, Sun, Moon, ShieldCheck, Archive, CheckSquare, Wallet, X, LogOut, Cloud, RefreshCw, User as UserIcon, Bell } from 'lucide-react';
import { useProjects } from '../lib/ProjectContext';
import { UserRole } from '../types';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { darkMode, setDarkMode, permissions, currentUserRole, currentUserName, currentUser, logout, isSyncing, unreadNotificationCount } = useProjects();
  const navigate = useNavigate();
  const userPerms = permissions[currentUserRole];

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, visible: userPerms.dashboard },
    { name: 'Notifications', path: '/notifications', icon: Bell, visible: true, badge: unreadNotificationCount },
    { name: 'My Workboard', path: '/my-tasks', icon: CheckSquare, visible: true },
    { name: 'Sales Pipeline', path: '/sales', icon: Target, visible: userPerms.sales },
    { name: 'Ongoing Projects', path: '/ongoing-projects', icon: Briefcase, visible: userPerms.ongoing },
    { name: 'Claim Management', path: '/claims', icon: Wallet, visible: userPerms.viewFinancials },
    { name: 'Project Archive', path: '/archive', icon: Archive, visible: userPerms.archive },
    { name: 'Team Traffic', path: '/team', icon: Users, visible: userPerms.team },
    { name: 'Role Management', path: '/roles', icon: ShieldCheck, visible: userPerms.roles },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const handleProfileClick = () => {
    navigate('/profile');
    if (onClose) onClose();
  };

  return (
    <aside className="w-64 h-full bg-[#1061C3] dark:bg-slate-900 text-white flex flex-col shadow-2xl overflow-hidden transition-colors duration-300 lg:m-4 lg:rounded-[2.5rem] lg:h-[calc(100vh-2rem)]">
      <div className="p-8 flex flex-col items-center border-b border-blue-400/30 dark:border-slate-800 relative">
        <button onClick={onClose} className="lg:hidden absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all">
          <X className="w-5 h-5 text-white/70" />
        </button>

        <button onClick={handleProfileClick} className="relative mb-4 group cursor-pointer">
          <div className="w-16 h-16 rounded-full border-2 border-white/50 p-1 group-hover:border-white transition-all overflow-hidden bg-blue-100">
            {currentUser?.avatar_url ? (
              <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUserName}`} alt="Profile" className="w-full h-full rounded-full" />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-[#1061C3] dark:border-slate-900 rounded-full"></div>
        </button>
        <div className="text-center">
          <p className="font-bold text-sm">{currentUserRole} Portal</p>
          <p className="text-[9px] text-blue-100/70 mt-1 uppercase tracking-widest font-black">{currentUserName}</p>
        </div>
        
        {/* Cloud Status Indicator */}
        <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
          {isSyncing ? (
            <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
          ) : (
            <Cloud className="w-3 h-3 text-emerald-400" />
          )}
          <span className="text-[8px] font-black uppercase tracking-widest">
            {isSyncing ? 'Syncing Cloud' : 'Cloud Active'}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.filter(item => item.visible).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group ${
                isActive ? 'bg-white text-[#1061C3] dark:bg-slate-800 dark:text-blue-400 font-bold shadow-lg' : 'text-blue-100/80 dark:text-slate-400 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <div className="flex items-center space-x-4">
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </div>
            {item.badge && item.badge > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg ring-2 ring-[#1061C3] dark:ring-slate-900 animate-pulse">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 space-y-4">
        <div className="bg-black/10 dark:bg-slate-800 rounded-2xl p-1 flex items-center justify-between">
          <button onClick={() => setDarkMode(false)} className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all ${!darkMode ? 'bg-white text-[#1061C3] shadow-md' : 'text-blue-200'}`}>
            <Sun className="w-4 h-4" />
          </button>
          <button onClick={() => setDarkMode(true)} className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all ${darkMode ? 'bg-slate-700 text-white shadow-md' : 'text-blue-200'}`}>
            <Moon className="w-4 h-4" />
          </button>
        </div>
        
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-white/10 hover:bg-rose-500 text-blue-100 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
