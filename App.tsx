
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import OngoingProjects from './pages/OngoingProjects';
import ProjectDetails from './pages/ProjectDetails';
import ProjectArchive from './pages/ProjectArchive';
import Team from './pages/Team';
import UserWorkload from './pages/UserWorkload';
import Roles from './pages/Roles';
import MyTasks from './pages/MyTasks';
import Notifications from './pages/Notifications';
import ClaimManagement from './pages/ClaimManagement';
import ClaimDetails from './pages/ClaimDetails';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { ProjectProvider, useProjects } from './lib/ProjectContext';
import { Menu, X } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useProjects();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-[#F4F7FE] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Toggleable on mobile */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Top Nav */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <Menu className="w-6 h-6 text-[#1061C3]" />
            </button>
            <span className="font-black text-slate-800 dark:text-white text-lg tracking-tight">EDT</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useProjects();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ProjectProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/my-tasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
            <Route path="/ongoing-projects" element={<ProtectedRoute><OngoingProjects /></ProtectedRoute>} />
            <Route path="/archive" element={<ProtectedRoute><ProjectArchive /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
            <Route path="/team/:id/workload" element={<ProtectedRoute><UserWorkload /></ProtectedRoute>} />
            <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
            <Route path="/claims" element={<ProtectedRoute><ClaimManagement /></ProtectedRoute>} />
            <Route path="/claims/:id" element={<ProtectedRoute><ClaimDetails /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </HashRouter>
    </ProjectProvider>
  );
};

export default App;
