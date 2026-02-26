
import React, { useState, useMemo } from 'react';
import { useProjects } from '../lib/ProjectContext';
import { Project, ProjectStatus, ProjectType, Task } from '../types';
import { Rocket, Edit3, GripVertical, Plus, X, ChevronRight, Lock, Phone, User, Tag, ChevronDown, CheckSquare, ExternalLink, Settings, AlertCircle, Clock, Zap, HelpCircle, LayoutGrid, BarChart2, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import { FigmaIcon, GDriveIcon } from '../components/BrandIcons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const ProjectCard: React.FC<{ 
  project: Project; 
  onEdit: (p: Project) => void;
  onGreenlight: (id: string) => void;
  onLost: (id: string) => void;
  canSeeFinancials: boolean;
  taskCount: number;
  tasks: Task[];
  thresholds: { hotToWarm: number; warmToCold: number; coldStagnant: number };
}> = ({ project, onEdit, onGreenlight, onLost, canSeeFinancials, taskCount, tasks, thresholds }) => {
  const statusMap: Record<ProjectStatus, { text: string; bg: string }> = {
    'Cold': { text: 'Cold', bg: 'bg-gray-100 dark:bg-slate-800 text-gray-500' },
    'Warm': { text: 'Warm', bg: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' },
    'Hot': { text: 'Hot', bg: 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' },
    'Pre Prod': { text: 'Pre Prod', bg: 'bg-purple-50 dark:bg-purple-900/20 text-purple-500' },
    'Development': { text: 'Developing', bg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' },
    'Closure': { text: 'Closing', bg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' },
    'Completed': { text: 'Completed', bg: 'bg-emerald-500 text-white' },
    'Lost': { text: 'Lost', bg: 'bg-red-500 text-white' }
  };
  const currentStatus = statusMap[project.status] || { text: project.status, bg: 'bg-gray-100 text-gray-500' };

  // Calculate inactivity for visual warning
  const projectTasks = tasks.filter(t => String(t.project_id) === String(project.id));
  const activityDates: number[] = [new Date(project.kickoff_date || project.start_date).getTime()];
  projectTasks.forEach(t => {
    if (t.start_date) activityDates.push(new Date(t.start_date).getTime());
    if (t.completed_at) activityDates.push(new Date(t.completed_at).getTime());
  });
  const lastActivity = Math.max(...activityDates);
  const diffDays = Math.floor((new Date().getTime() - lastActivity) / (1000 * 60 * 60 * 24));
  
  let currentThreshold = 999;
  if (project.status === 'Hot') currentThreshold = thresholds.hotToWarm;
  else if (project.status === 'Warm') currentThreshold = thresholds.warmToCold;
  else if (project.status === 'Cold') currentThreshold = thresholds.coldStagnant;

  const isStagnant = diffDays >= currentThreshold;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('projectId', String(project.id));
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-sm border hover:shadow-lg transition-all group relative animate-in slide-in-from-bottom-2 cursor-grab active:cursor-grabbing ${isStagnant ? 'border-amber-200 dark:border-amber-900/50' : 'border-gray-100 dark:border-slate-800'}`}
    >
      {isStagnant && (
        <div className="absolute -top-2 -right-1 z-10 flex items-center gap-1 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-tighter border border-amber-200 dark:border-amber-800 shadow-sm animate-pulse">
           <AlertCircle className="w-2 h-2" /> {project.status === 'Cold' ? 'POTENTIALLY LOST' : `STAGNANT ${diffDays}d`}
        </div>
      )}

      <div className="flex items-start gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-shrink-0 items-center justify-center font-black text-xs text-indigo-600">
           {project.client_name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 line-clamp-1 leading-tight">
            {project.project_name}
          </h4>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate">{project.client_name}</p>
        </div>
        <div className="flex flex-col gap-1 items-center">
          <GripVertical className="w-3.5 h-3.5 text-gray-200" />
          <button onClick={() => onEdit(project)} className="p-1 rounded-lg text-gray-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
            <Edit3 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <Link to={`/projects/${project.id}`} className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-slate-800 rounded-lg text-[8px] font-black text-gray-400 uppercase transition-all hover:bg-indigo-50 hover:text-indigo-600 border border-transparent hover:border-indigo-100">
          <ExternalLink className="w-2.5 h-2.5" /> Details
        </Link>
        <Link to={`/projects/${project.id}`} className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-slate-800 rounded-lg text-[8px] font-black text-blue-600 uppercase transition-all hover:bg-blue-600 hover:text-white border border-blue-100 dark:border-slate-700">
          <CheckSquare className="w-2.5 h-2.5" /> {taskCount} Tasks
        </Link>
      </div>

      <div className="flex gap-1.5 mb-3">
         <a href={project.figma_link || '#'} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[8px] font-black uppercase hover:bg-gray-100 transition-all shadow-sm border border-gray-100 dark:border-slate-800">
            <FigmaIcon className="w-2.5 h-2.5" /> Figma
         </a>
         <a href={project.gdrive_link || '#'} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[8px] font-black uppercase hover:bg-gray-100 transition-all shadow-sm border border-gray-100 dark:border-slate-800">
            <GDriveIcon className="w-2.5 h-2.5" /> Drive
         </a>
      </div>

      <div className="bg-gray-50 dark:bg-slate-800/30 rounded-xl p-2 mb-3 border border-gray-100 dark:border-slate-800/50 flex items-center justify-between">
         <div className="flex items-center gap-2 truncate">
            <User className="w-2.5 h-2.5 text-indigo-400" />
            <span className="text-[9px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest truncate">{project.contact_person || 'N/A'}</span>
         </div>
         <div className="flex items-center gap-2">
            <Users className="w-2.5 h-2.5 text-blue-400" />
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{project.lead_by || 'Unknown'}</span>
         </div>
      </div>

      <div className="flex justify-between items-center mb-4 text-[9px] font-bold">
        <div className="flex flex-col">
          <span className="text-gray-400 uppercase tracking-widest leading-none mb-1">Revenue</span>
          <span className="text-slate-800 dark:text-slate-300 leading-none">
            {canSeeFinancials ? `RM ${(project.budget/1000).toFixed(1)}k` : <Lock className="w-2.5 h-2.5 opacity-30" />}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-gray-400 uppercase tracking-widest leading-none mb-1">Status</span>
          <span className={`px-2 py-0.5 rounded-full font-black ${currentStatus.bg}`}>{currentStatus.text}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => onGreenlight(project.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-sm"
        >
          <Rocket className="w-2.5 h-2.5" /> Greenlight
        </button>
        <button 
          onClick={() => onLost(project.id)}
          className="px-3 py-1.5 bg-rose-50 text-rose-500 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100"
        >
          Lost
        </button>
      </div>
    </div>
  );
};

const Sales: React.FC = () => {
  const { projects, tasks, staff, updateProjectStatus, addProject, updateProject, permissions, currentUserRole, automationSettings, updateAutomationSettings } = useProjects();
  const salesProjects = projects.filter(p => ['Cold', 'Warm', 'Hot'].includes(p.status));
  const canSeeFinancials = permissions[currentUserRole].viewFinancials;
  
  const [view, setView] = useState<'board' | 'dashboard'>('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [confirmData, setConfirmData] = useState<{ id: string, type: 'greenlight' | 'lost' } | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [dragCounter, setDragCounter] = useState<Record<string, number>>({});
  
  const [filterStartMonth, setFilterStartMonth] = useState(new Date().getMonth() + 1);
  const [filterStartYear, setFilterStartYear] = useState(new Date().getFullYear());
  const [filterEndMonth, setFilterEndMonth] = useState(new Date().getMonth() + 1);
  const [filterEndYear, setFilterEndYear] = useState(new Date().getFullYear());
  
  const [formData, setFormData] = useState<Partial<Project>>({
    status: 'Cold', budget: 0, progress: 0,
    project_type: 'Servicing' as ProjectType,
    kickoff_date: new Date().toISOString().split('T')[0],
    delivery_date: new Date().toISOString().split('T')[0],
    has_event: false,
    figma_link: '',
    gdrive_link: '',
    contact_person: '',
    contact_phone: '',
    tags: '',
    lead_by: ''
  });

  const dashboardStats = useMemo(() => {
    const totalLeadValue = salesProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
    
    const valuePerPerson: Record<string, { value: number, projects: Project[] }> = {};
    salesProjects.forEach(p => {
      const leadBy = p.lead_by || 'Unassigned';
      if (!valuePerPerson[leadBy]) valuePerPerson[leadBy] = { value: 0, projects: [] };
      valuePerPerson[leadBy].value += (Number(p.budget) || 0);
      valuePerPerson[leadBy].projects.push(p);
    });

    const chartData = Object.entries(valuePerPerson)
      .map(([name, data]) => ({ name, value: data.value, projects: data.projects }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    // Greenlighted Projects Data (Filtered Range)
    const startDate = new Date(filterStartYear, filterStartMonth - 1, 1);
    const endDate = new Date(filterEndYear, filterEndMonth, 0); // Last day of endMonth

    const greenlightedProjects = projects.filter(p => 
      !['Cold', 'Warm', 'Hot', 'Lost'].includes(p.status) &&
      p.kickoff_date && 
      new Date(p.kickoff_date) >= startDate && 
      new Date(p.kickoff_date) <= endDate
    );

    const greenlightedValue = greenlightedProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
    
    const greenlightedPerPerson: Record<string, number> = {};
    greenlightedProjects.forEach(p => {
      const leadBy = p.lead_by || 'Unassigned';
      greenlightedPerPerson[leadBy] = (greenlightedPerPerson[leadBy] || 0) + (Number(p.budget) || 0);
    });

    const greenlightedChartData = Object.entries(greenlightedPerPerson)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return { 
      totalLeadValue, 
      chartData, 
      greenlightedValue, 
      greenlightedChartData, 
      greenlightedCount: greenlightedProjects.length 
    };
  }, [salesProjects, projects, filterStartMonth, filterStartYear, filterEndMonth, filterEndYear]);

  const months = [
    { val: 1, label: 'Jan' }, { val: 2, label: 'Feb' }, { val: 3, label: 'Mar' },
    { val: 4, label: 'Apr' }, { val: 5, label: 'May' }, { val: 6, label: 'Jun' },
    { val: 7, label: 'Jul' }, { val: 8, label: 'Aug' }, { val: 9, label: 'Sep' },
    { val: 10, label: 'Oct' }, { val: 11, label: 'Nov' }, { val: 12, label: 'Dec' }
  ];
  
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsArr = [];
    for (let i = currentYear - 3; i <= currentYear + 1; i++) {
      yearsArr.push(i);
    }
    return yearsArr;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateProject({ ...editingProject, ...formData } as Project);
    } else {
      addProject({ id: Math.random().toString(36).substr(2, 9), ...formData, project_type: 'Servicing', start_date: formData.kickoff_date } as Project);
    }
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleActionConfirm = () => {
    if (!confirmData) return;
    updateProjectStatus(confirmData.id, confirmData.type === 'greenlight' ? 'Pre Prod' : 'Lost');
    setConfirmData(null);
  };

  const onDragEnter = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragCounter(prev => ({ ...prev, [status]: (prev[status] || 0) + 1 }));
    setDragOverStatus(status);
  };

  const onDragLeave = (e: React.DragEvent, status: string) => {
    const newCount = (dragCounter[status] || 0) - 1;
    setDragCounter(prev => ({ ...prev, [status]: newCount }));
    if (newCount <= 0) {
      setDragOverStatus(null);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent, status: ProjectStatus) => {
    e.preventDefault();
    setDragOverStatus(null);
    setDragCounter({});
    const id = e.dataTransfer.getData('projectId');
    if (id) updateProjectStatus(id, status);
  };

  return (
    <div className="h-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <div className="flex items-center gap-3">
               <h1 className="text-2xl font-black text-slate-800 dark:text-white">Sales Pipeline</h1>
               <button 
                 onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                 className={`p-2 rounded-xl transition-all ${isSettingsOpen ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-gray-400 border border-gray-100 dark:border-slate-800'}`}
                 title="Pipeline Automations"
               >
                  <Settings className="w-4 h-4" />
               </button>
            </div>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Lead Management & Funnel Tracking</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl flex items-center shadow-sm border border-gray-100 dark:border-slate-800">
            <button 
              onClick={() => setView('board')} 
              className={`p-2 rounded-xl transition-all ${view === 'board' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-indigo-600'}`}
              title="Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView('dashboard')} 
              className={`p-2 rounded-xl transition-all ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-indigo-600'}`}
              title="Sales Dashboard"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button onClick={() => { setEditingProject(null); setFormData({ status: 'Cold', project_type: 'Servicing', budget: 0, kickoff_date: new Date().toISOString().split('T')[0], delivery_date: new Date().toISOString().split('T')[0], has_event: false, lead_by: '' }); setIsModalOpen(true); }} className="bg-[#0D2440] dark:bg-blue-600 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-[10px] font-black flex items-center transition-all shadow-lg transform active:scale-95">
          <Plus className="w-4 h-4 mr-2" /> New Prospect
        </button>
      </div>

      {isSettingsOpen && (
        <div className="mb-8 p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30 animate-in slide-in-from-top-4">
           <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-indigo-600 shadow-sm">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Inactivity Automations</h4>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">Define days of no tasks/updates before a lead drops tier.</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Hot → Warm
                 </label>
                 <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 px-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <input 
                      type="number"
                      className="w-full bg-transparent border-0 outline-none font-black text-indigo-600 dark:text-indigo-400 text-center"
                      value={automationSettings.salesThresholds.hotToWarm}
                      onChange={(e) => updateAutomationSettings({ ...automationSettings, salesThresholds: { ...automationSettings.salesThresholds, hotToWarm: Number(e.target.value) } })}
                    />
                    <span className="text-[9px] font-black text-gray-400 uppercase">Days</span>
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Warm → Cold
                 </label>
                 <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 px-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <input 
                      type="number"
                      className="w-full bg-transparent border-0 outline-none font-black text-indigo-600 dark:text-indigo-400 text-center"
                      value={automationSettings.salesThresholds.warmToCold}
                      onChange={(e) => updateAutomationSettings({ ...automationSettings, salesThresholds: { ...automationSettings.salesThresholds, warmToCold: Number(e.target.value) } })}
                    />
                    <span className="text-[9px] font-black text-gray-400 uppercase">Days</span>
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Cold Stagnant
                 </label>
                 <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 px-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <input 
                      type="number"
                      className="w-full bg-transparent border-0 outline-none font-black text-indigo-600 dark:text-indigo-400 text-center"
                      value={automationSettings.salesThresholds.coldStagnant}
                      onChange={(e) => updateAutomationSettings({ ...automationSettings, salesThresholds: { ...automationSettings.salesThresholds, coldStagnant: Number(e.target.value) } })}
                    />
                    <span className="text-[9px] font-black text-gray-400 uppercase">Days</span>
                 </div>
              </div>
           </div>

           <div className="mt-6 flex items-center gap-3 p-4 bg-white/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-indigo-100 dark:border-indigo-900/40">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <p className="text-[9px] font-bold text-gray-500 leading-relaxed">
                Leads move down one tier when the specified days pass without a task being created or completed. 
                <span className="text-indigo-500 ml-1">Cold leads only trigger a notification notice for manual archival.</span>
              </p>
           </div>
        </div>
      )}

      {view === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10 h-[calc(100vh-200px)]">
          {(['Cold', 'Warm', 'Hot'] as ProjectStatus[]).map(status => (
            <div 
              key={status} 
              className={`flex flex-col h-full transition-all duration-300 ${dragOverStatus === status ? 'scale-[1.01]' : ''}`}
              onDragEnter={(e) => onDragEnter(e, status)}
              onDragLeave={(e) => onDragLeave(e, status)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, status)}
            >
              <div className="flex items-center justify-between px-3 mb-3">
                <h2 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${status === 'Cold' ? 'bg-gray-400' : status === 'Warm' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                  {status} Leads
                </h2>
                <span className="text-[9px] font-black text-gray-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full shadow-sm border border-gray-100 dark:border-slate-800">
                  {salesProjects.filter(p => p.status === status).length}
                </span>
              </div>
              <div className={`space-y-4 flex-1 p-3 rounded-[2rem] border transition-colors duration-300 overflow-y-auto scrollbar-hide ${
                dragOverStatus === status 
                  ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-400 dark:border-indigo-600 border-dashed' 
                  : 'bg-gray-50/50 dark:bg-slate-800/20 border-gray-100 dark:border-slate-800'
              }`}>
                {salesProjects.filter(p => p.status === status).map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onEdit={(p) => { setEditingProject(p); setFormData(p); setIsModalOpen(true); }} 
                    onGreenlight={(id) => setConfirmData({ id, type: 'greenlight' })}
                    onLost={(id) => setConfirmData({ id, type: 'lost' })}
                    canSeeFinancials={canSeeFinancials}
                    taskCount={tasks.filter(t => String(t.project_id) === String(project.id)).length}
                    tasks={tasks}
                    thresholds={automationSettings.salesThresholds}
                  />
                ))}
                {salesProjects.filter(p => p.status === status).length === 0 && (
                  <div className="h-32 flex items-center justify-center text-[9px] font-black text-gray-300 uppercase italic">Empty Sector</div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-500">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Pipeline Value</h4>
              </div>
              <p className="text-4xl font-black text-slate-800 dark:text-white">
                {canSeeFinancials ? `RM ${(dashboardStats.totalLeadValue / 1000).toFixed(1)}k` : 'CONFIDENTIAL'}
              </p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                <TrendingUp className="w-3.5 h-3.5" />
                {salesProjects.length} Active Leads
              </div>
            </div>

            <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-500">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Greenlighted Performance</h4>
                    <p className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">Conversion Tracking</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 px-3">
                    <span className="text-[8px] font-black text-gray-400 uppercase">From</span>
                    <div className="flex items-center gap-1">
                      <select 
                        value={filterStartMonth} 
                        onChange={(e) => setFilterStartMonth(Number(e.target.value))}
                        className="bg-transparent border-0 outline-none text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase cursor-pointer"
                      >
                        {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                      </select>
                      <select 
                        value={filterStartYear} 
                        onChange={(e) => setFilterStartYear(Number(e.target.value))}
                        className="bg-transparent border-0 outline-none text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase cursor-pointer"
                      >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="w-px h-4 bg-gray-200 dark:bg-slate-700" />
                  <div className="flex items-center gap-2 px-3">
                    <span className="text-[8px] font-black text-gray-400 uppercase">To</span>
                    <div className="flex items-center gap-1">
                      <select 
                        value={filterEndMonth} 
                        onChange={(e) => setFilterEndMonth(Number(e.target.value))}
                        className="bg-transparent border-0 outline-none text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase cursor-pointer"
                      >
                        {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                      </select>
                      <select 
                        value={filterEndYear} 
                        onChange={(e) => setFilterEndYear(Number(e.target.value))}
                        className="bg-transparent border-0 outline-none text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase cursor-pointer"
                      >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-4xl font-black text-slate-800 dark:text-white">
                    {canSeeFinancials ? `RM ${(dashboardStats.greenlightedValue / 1000).toFixed(1)}k` : 'CONFIDENTIAL'}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                    <CheckSquare className="w-3.5 h-3.5" />
                    {dashboardStats.greenlightedCount} Projects Moved
                  </div>
                  <p className="mt-6 text-[9px] font-bold text-gray-400 uppercase leading-relaxed max-w-[200px]">
                    Showing conversion data from {months.find(m => m.val === filterStartMonth)?.label} {filterStartYear} to {months.find(m => m.val === filterEndMonth)?.label} {filterEndYear}.
                  </p>
                </div>

                <div className="h-[150px] w-full">
                  {dashboardStats.greenlightedChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardStats.greenlightedChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {dashboardStats.greenlightedChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800">
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{payload[0].payload.name}</p>
                                  <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                                    {canSeeFinancials ? `RM ${(Number(payload[0].value) / 1000).toFixed(1)}k` : 'CONFIDENTIAL'}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-50 dark:border-slate-800 rounded-[2rem]">
                      <p className="text-[10px] font-black text-gray-300 uppercase italic">No greenlights in range</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-500">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Lead Ownership & Distribution</h4>
                <p className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">Value Share & Active Project Portfolio</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Pie Chart Section */}
              <div className="lg:col-span-4 flex flex-col justify-center border-r border-gray-50 dark:border-slate-800/50 pr-8">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardStats.chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {dashboardStats.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                                <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                  {canSeeFinancials ? `RM ${(Number(payload[0].value) / 1000).toFixed(1)}k` : 'CONFIDENTIAL'}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Total Pipeline Value</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white text-center">
                    {canSeeFinancials ? `RM ${(dashboardStats.totalLeadValue / 1000).toFixed(1)}k` : 'CONFIDENTIAL'}
                  </p>
                </div>
              </div>

              {/* Distribution List Section */}
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-hide">
                  {dashboardStats.chartData.map((item, idx) => (
                    <div key={idx} className="p-5 bg-gray-50 dark:bg-slate-800/50 rounded-[2rem] border border-gray-100 dark:border-slate-800 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-gray-100 dark:border-slate-700">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <p className="text-xs font-black text-slate-800 dark:text-white">{item.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                            {canSeeFinancials ? `RM ${(item.value / 1000).toFixed(1)}k` : 'CONFIDENTIAL'}
                          </p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                            {((item.value / dashboardStats.totalLeadValue) * 100).toFixed(0)}% Share
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        {item.projects.map(p => (
                          <Link key={p.id} to={`/projects/${p.id}`} className="block p-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{p.project_name}</span>
                              <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase ${
                                p.status === 'Hot' ? 'bg-rose-50 text-rose-500' : 
                                p.status === 'Warm' ? 'bg-amber-50 text-amber-500' : 
                                'bg-gray-100 text-gray-500'
                              }`}>
                                {p.status}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0D2440]/40 dark:bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-[#F4F7FE]/50 dark:bg-slate-800/50">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">{editingProject ? 'Modify Prospect' : 'Add Prospect'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all"><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase">Project</label><input required className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none dark:text-white font-bold" value={formData.project_name || ''} onChange={e => setFormData({...formData, project_name: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase">Client</label><input required className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none dark:text-white font-bold" value={formData.client_name || ''} onChange={e => setFormData({...formData, client_name: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase">Contact Name</label><input className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none dark:text-white font-bold" value={formData.contact_person || ''} onChange={e => setFormData({...formData, contact_person: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase">Phone #</label><input className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none dark:text-white font-bold" value={formData.contact_phone || ''} onChange={e => setFormData({...formData, contact_phone: e.target.value})} /></div>
              </div>
              <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase">Tags</label><input placeholder="e.g. Urgent, Retainer, Video" className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none dark:text-white font-bold" value={formData.tags || ''} onChange={e => setFormData({...formData, tags: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase">Funnel Status</label><select className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none dark:text-white font-bold appearance-none cursor-pointer" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ProjectStatus})}><option value="Cold">Cold</option><option value="Warm">Warm</option><option value="Hot">Hot</option></select></div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase">Lead By</label>
                  <select className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none dark:text-white font-bold appearance-none cursor-pointer" value={formData.lead_by || ''} onChange={e => setFormData({...formData, lead_by: e.target.value})}>
                    <option value="">Select Owner</option>
                    {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {canSeeFinancials && <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase">Est. Revenue</label><input type="number" className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none dark:text-white font-bold" value={formData.budget || ''} onChange={e => setFormData({...formData, budget: Number(e.target.value)})} /></div>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase">Figma Link</label>
                  <input className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none text-slate-800 dark:text-white font-bold" placeholder="https://figma.com/..." value={formData.figma_link || ''} onChange={e => setFormData({...formData, figma_link: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase">Google Drive Link</label>
                  <input className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none text-slate-800 dark:text-white font-bold" placeholder="https://drive.google.com/..." value={formData.gdrive_link || ''} onChange={e => setFormData({...formData, gdrive_link: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase">Kickoff Date</label>
                  <input type="date" className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none text-slate-800 dark:text-white font-bold" value={formData.kickoff_date || ''} onChange={e => setFormData({...formData, kickoff_date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase">Delivery Date</label>
                  <input type="date" className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none text-slate-800 dark:text-white font-bold" value={formData.delivery_date || ''} onChange={e => setFormData({...formData, delivery_date: e.target.value})} />
                </div>
              </div>
              <div className="pt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-black uppercase text-gray-400">Cancel</button>
                <button type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs">Sync Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={!!confirmData}
        onClose={() => setConfirmData(null)}
        onConfirm={handleActionConfirm}
        title={confirmData?.type === 'greenlight' ? 'Authorize Delivery?' : 'Close Prospect?'}
        message={confirmData?.type === 'greenlight' ? 'This lead has been greenlighted for production. Operations will be notified.' : 'This lead will be moved to the archive as Lost.'}
        confirmLabel={confirmData?.type === 'greenlight' ? 'Greenlight' : 'Mark Lost'}
        confirmColor={confirmData?.type === 'greenlight' ? 'emerald' : 'red'}
      />
    </div>
  );
};

export default Sales;
