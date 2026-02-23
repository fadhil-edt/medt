
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../lib/ProjectContext';
import { Project, ProjectStatus, ProjectType } from '../types';
import { Plus, X, LayoutGrid, List as ListIcon, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Rocket, GripVertical, Edit3, Phone, Activity } from 'lucide-react';

// --- Sub-Components ---

const ProjectCard: React.FC<{ project: Project; isSales: boolean; onEdit: (p: Project) => void }> = ({ project, isSales, onEdit }) => {
  const { updateProjectStatus } = useProjects();

  const handleGreenlight = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateProjectStatus(project.id, 'Pre Prod');
  };

  // Fix: Added missing 'Completed' and 'Lost' to satisfy Record<ProjectStatus, ...>
  const statusMap: Record<ProjectStatus, { text: string; bg: string }> = {
    'Cold': { text: 'Draft', bg: 'bg-gray-100 text-gray-500' },
    'Warm': { text: 'Observation', bg: 'bg-amber-50 text-amber-500' },
    'Hot': { text: 'Hot Lead', bg: 'bg-rose-50 text-rose-500' },
    'Pre Prod': { text: 'Pre Prod', bg: 'bg-purple-50 text-purple-500' },
    'Development': { text: 'Under Treatment', bg: 'bg-blue-50 text-blue-500' },
    'Closure': { text: 'Recovered', bg: 'bg-emerald-50 text-emerald-500' },
    'Completed': { text: 'Completed', bg: 'bg-emerald-600 text-white' },
    'Lost': { text: 'Lost', bg: 'bg-red-600 text-white' }
  };

  const currentStatus = statusMap[project.status] || { text: project.status, bg: 'bg-gray-100 text-gray-500' };

  return (
    <div 
      draggable 
      className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative cursor-grab active:cursor-grabbing select-none"
      onDragStart={(e) => {
        const target = e.currentTarget as HTMLElement;
        e.dataTransfer.setData('projectId', project.id);
        e.dataTransfer.setData('sourcePipeline', isSales ? 'sales' : 'ops');
        requestAnimationFrame(() => target.style.opacity = '0.5');
      }}
      onDragEnd={(e) => {
        (e.currentTarget as HTMLElement).style.opacity = '1';
      }}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 p-0.5 border border-blue-100 overflow-hidden">
          <img 
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${project.client_name}`} 
            className="w-full h-full rounded-2xl" 
            alt="client"
          />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{project.project_name}</h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{project.client_name}</p>
        </div>
        <div className="flex flex-col gap-1">
           <button 
             onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(project); }}
             className="p-1.5 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
           >
             <Edit3 className="w-3.5 h-3.5" />
           </button>
           <GripVertical className="w-4 h-4 text-gray-200" />
        </div>
      </div>

      <div className="flex gap-2 mb-6">
         <button className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            <Phone className="w-3 h-3" />
            Phone
         </button>
         <button className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
            <Activity className="w-3 h-3" />
            Live Vital
         </button>
      </div>

      <div className="space-y-2 mb-6 text-[10px] font-bold">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 uppercase tracking-widest">Revenue, Prog</span>
          <span className="text-slate-800">RM {project.budget.toLocaleString()}, {project.progress}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 uppercase tracking-widest">Manager</span>
          <span className="text-slate-800">Ronald</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 uppercase tracking-widest">Delivery</span>
          <span className="text-slate-800">{new Date(project.delivery_date).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full ${currentStatus.bg}`}>
          {currentStatus.text}
        </span>
      </div>

      {isSales && (
        <button 
          onClick={handleGreenlight}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-[#0D2440] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
        >
          <Rocket className="w-3 h-3" />
          Greenlight
        </button>
      )}

      <Link to={`/projects/${project.id}`} className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="w-8 h-8 bg-[#1061C3] text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white">
           <ChevronRight className="w-4 h-4 rotate-90" />
        </div>
      </Link>
    </div>
  );
};

const KanbanColumn: React.FC<{ title: string; status: ProjectStatus; projects: Project[]; isSales: boolean; onEdit: (p: Project) => void }> = ({ title, status, projects, isSales, onEdit }) => {
  const { updateProjectStatus } = useProjects();
  const [isOver, setIsOver] = useState(false);
  const filteredProjects = projects.filter((p) => p.status === status);
  
  // Fix: Added missing 'Completed' and 'Lost' to satisfy Record<ProjectStatus, string>
  const statusDots: Record<ProjectStatus, string> = {
    'Cold': 'bg-gray-400',
    'Warm': 'bg-amber-400',
    'Hot': 'bg-rose-400',
    'Pre Prod': 'bg-purple-400',
    'Development': 'bg-blue-400',
    'Closure': 'bg-emerald-400',
    'Completed': 'bg-emerald-600',
    'Lost': 'bg-red-600'
  };

  return (
    <div 
      className="flex-1 min-w-[320px] pb-10"
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        const projectId = e.dataTransfer.getData('projectId');
        const sourcePipeline = e.dataTransfer.getData('sourcePipeline');
        const targetPipeline = isSales ? 'sales' : 'ops';
        if (sourcePipeline === targetPipeline) updateProjectStatus(projectId, status);
      }}
    >
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="font-black text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
            <span className={`w-2 h-2 rounded-full ${statusDots[status]}`}></span>
            {title}
        </h2>
        <span className="text-[10px] font-black bg-white px-3 py-1 rounded-full text-slate-400 shadow-sm border border-gray-100">
          {filteredProjects.length}
        </span>
      </div>
      <div className={`space-y-6 min-h-[500px] transition-all duration-300 ${
        isOver ? 'scale-[1.02] opacity-80' : ''
      }`}>
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} isSales={isSales} onEdit={onEdit} />
        ))}
        {filteredProjects.length === 0 && (
            <div className="h-40 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex items-center justify-center text-gray-300 text-[10px] font-black uppercase tracking-[0.2em]">
                Drop here
            </div>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---

const Projects: React.FC = () => {
  const { projects, addProject, updateProject } = useProjects();
  const [view, setView] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Fix: Initialized formData with project_type to avoid missing property errors
  const [formData, setFormData] = useState<Partial<Project>>({
    status: 'Cold',
    project_type: 'Servicing',
    budget: 0,
    kickoff_date: new Date().toISOString().split('T')[0],
    delivery_date: new Date().toISOString().split('T')[0],
    has_event: false
  });

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({ status: 'Cold', project_type: 'Servicing', budget: 0, kickoff_date: new Date().toISOString().split('T')[0], delivery_date: new Date().toISOString().split('T')[0], has_event: false });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_name || !formData.client_name) return;

    if (editingProject) {
      updateProject({ ...editingProject, ...formData } as Project);
    } else {
      // Fix: Added project_type property to the newProject object
      const newProject: Project = {
        id: Math.random().toString(36).substr(2, 9),
        project_name: formData.project_name,
        client_name: formData.client_name,
        status: (formData.status as ProjectStatus) || 'Cold',
        project_type: (formData.project_type as ProjectType) || 'Servicing',
        budget: Number(formData.budget) || 0,
        start_date: formData.kickoff_date || new Date().toISOString().split('T')[0],
        kickoff_date: formData.kickoff_date || new Date().toISOString().split('T')[0],
        delivery_date: formData.delivery_date || new Date().toISOString().split('T')[0],
        progress: 0,
        has_event: formData.has_event,
        event_start_date: formData.has_event ? formData.event_start_date : undefined,
        event_end_date: formData.has_event ? formData.event_end_date : undefined,
      };
      addProject(newProject);
    }
    closeModal();
  };

  return (
    <div className="h-full flex flex-col relative pb-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Project Pipeline</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Nurture leads and manage delivery cycles.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded-2xl flex items-center shadow-sm border border-gray-100">
                <button onClick={() => setView('kanban')} className={`p-2.5 rounded-xl transition-all ${view === 'kanban' ? 'bg-[#1061C3] text-white' : 'text-gray-400 hover:text-blue-600'}`}><LayoutGrid className="w-4 h-4" /></button>
                <button onClick={() => setView('list')} className={`p-2.5 rounded-xl transition-all ${view === 'list' ? 'bg-[#1061C3] text-white' : 'text-gray-400 hover:text-blue-600'}`}><ListIcon className="w-4 h-4" /></button>
                <button onClick={() => setView('calendar')} className={`p-2.5 rounded-xl transition-all ${view === 'calendar' ? 'bg-[#1061C3] text-white' : 'text-gray-400 hover:text-blue-600'}`}><CalendarIcon className="w-4 h-4" /></button>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-[#0D2440] hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-sm font-black flex items-center transition-all shadow-lg transform active:scale-95">
                <Plus className="w-4 h-4 mr-2" /> New Project
            </button>
        </div>
      </div>

      <div className="flex-1 space-y-16">
        {view === 'kanban' ? (
          <>
            <section>
              <div className="mb-8 flex items-center gap-3">
                <div className="h-6 w-1 bg-amber-400 rounded-full"></div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Sales Pipeline</h2>
              </div>
              <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
                <KanbanColumn title="Draft" status="Cold" projects={projects} isSales={true} onEdit={openEditModal} />
                <KanbanColumn title="Observation" status="Warm" projects={projects} isSales={true} onEdit={openEditModal} />
                <KanbanColumn title="Hot Lead" status="Hot" projects={projects} isSales={true} onEdit={openEditModal} />
              </div>
            </section>
            <section>
              <div className="mb-8 flex items-center gap-3">
                <div className="h-6 w-1 bg-[#1061C3] rounded-full"></div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Operations Pipeline</h2>
              </div>
              <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
                <KanbanColumn title="Pre Prod" status="Pre Prod" projects={projects} isSales={false} onEdit={openEditModal} />
                <KanbanColumn title="Under Treatment" status="Development" projects={projects} isSales={false} onEdit={openEditModal} />
                <KanbanColumn title="Recovered" status="Closure" projects={projects} isSales={false} onEdit={openEditModal} />
              </div>
            </section>
          </>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 text-center">
             <p className="text-gray-400 font-bold italic">List and Calendar views are being redesigned...</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0D2440]/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-[#F4F7FE]/50">
              <div>
                <h3 className="text-xl font-black text-slate-800">{editingProject ? 'Edit Entry' : 'Add New Entry'}</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Management Console</p>
              </div>
              <button onClick={closeModal} className="p-3 bg-white rounded-2xl shadow-sm text-gray-400 hover:text-slate-800 border border-gray-100 transition-all hover:rotate-90">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Project Name</label>
                  <input required type="text" className="w-full px-5 py-3.5 rounded-2xl bg-[#F4F7FE]/50 border-2 border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all font-bold" placeholder="e.g. Design System" value={formData.project_name || ''} onChange={e => setFormData({...formData, project_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Client Name</label>
                  <input required type="text" className="w-full px-5 py-3.5 rounded-2xl bg-[#F4F7FE]/50 border-2 border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all font-bold" placeholder="e.g. Acme Corp" value={formData.client_name || ''} onChange={e => setFormData({...formData, client_name: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Budget (RM)</label>
                  <input type="number" className="w-full px-5 py-3.5 rounded-2xl bg-[#F4F7FE]/50 border-2 border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all font-bold" value={formData.budget || ''} onChange={e => setFormData({...formData, budget: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Status</label>
                  <select className="w-full px-5 py-3.5 rounded-2xl bg-[#F4F7FE]/50 border-2 border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all font-bold appearance-none cursor-pointer" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ProjectStatus})}>
                    <option value="Cold">Draft</option>
                    <option value="Warm">Observation</option>
                    <option value="Hot">Hot Lead</option>
                    <option value="Pre Prod">Pre Prod</option>
                    <option value="Development">Under Treatment</option>
                    <option value="Closure">Recovered</option>
                  </select>
                </div>
              </div>

              <div className="pt-8 flex justify-end gap-4">
                <button type="button" onClick={closeModal} className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="px-10 py-4 text-xs font-black text-white bg-[#1061C3] hover:bg-blue-700 rounded-2xl shadow-xl shadow-blue-100 transition-all transform active:scale-95 uppercase tracking-widest">
                  {editingProject ? 'Save Changes' : 'Confirm Addition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
