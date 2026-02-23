
import React, { useState } from 'react';
import { useProjects } from '../lib/ProjectContext';
import { Project } from '../types';
import { ChevronRight, RotateCcw, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FigmaIcon, GDriveIcon } from '../components/BrandIcons';

const ArchivedCard: React.FC<{ project: Project; onRestore: (id: string) => void; canSeeFinancials: boolean }> = ({ project, onRestore, canSeeFinancials }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-xl transition-all group relative animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 rounded-2xl p-0.5 border flex items-center justify-center font-black ${project.status === 'Completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 border-red-100 text-red-600 dark:bg-red-900/20'}`}>
           {project.client_name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-black text-slate-800 dark:text-white line-clamp-1">{project.project_name}</h4>
            <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm ${project.project_type === 'Internal' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {project.project_type === 'Internal' ? 'INT' : 'SVC'}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{project.client_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onRestore(project.id)} title="Restore to Pipeline" className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-400 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"><RotateCcw className="w-4 h-4" /></button>
          <Link to={`/projects/${project.id}`} className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-400 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"><ChevronRight className="w-4 h-4" /></Link>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
         <a href={project.figma_link || '#'} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-slate-700 transition-all shadow-sm border border-gray-100 dark:border-slate-800">
            <FigmaIcon className="w-3.5 h-3.5 mr-1" /> Figma
         </a>
         <a href={project.gdrive_link || '#'} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-slate-700 transition-all shadow-sm border border-gray-100 dark:border-slate-800">
            <GDriveIcon className="w-3.5 h-3.5 mr-1" /> GDrive
         </a>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#F4F7FE]/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
           <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Final Budget</p>
           <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">
             {canSeeFinancials ? (
               project.project_type === 'Internal' ? 'Internal' : `RM ${project.budget.toLocaleString()}`
             ) : <Lock className="w-3 h-3 opacity-30" />}
           </p>
        </div>
        <div className="bg-[#F4F7FE]/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
           <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Status Date</p>
           <p className="text-xs font-black text-slate-800 dark:text-slate-200">{new Date(project.delivery_date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-50 dark:border-slate-800">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Archived Status</span>
        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full ${project.status === 'Completed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-none' : 'bg-red-500 text-white shadow-lg shadow-red-100 dark:shadow-none'}`}>
          {project.status === 'Completed' ? 'Delivered' : 'Terminated'}
        </span>
      </div>
    </div>
  );
};

const ProjectArchive: React.FC = () => {
  const { projects, updateProjectStatus, permissions, currentUserRole } = useProjects();
  const [activeTab, setActiveTab] = useState<'completed' | 'lost'>('completed');
  const canSeeFinancials = permissions[currentUserRole].viewFinancials;

  const completedProjects = projects.filter(p => p.status === 'Completed');
  const lostProjects = projects.filter(p => p.status === 'Lost');

  const handleRestore = (id: string) => {
    updateProjectStatus(id, activeTab === 'completed' ? 'Closure' : 'Cold');
  };

  return (
    <div className="h-full">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white">Project Archive</h1>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">History of all finalized or terminated entries.</p>
      </div>

      <div className="mb-10 flex gap-4 p-1 bg-white dark:bg-slate-900 rounded-3xl w-fit shadow-sm border border-gray-100 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('completed')}
          className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'completed' ? 'bg-[#1061C3] text-white shadow-lg' : 'text-gray-400 hover:text-slate-800 dark:hover:text-white'}`}
        >
          Completed Projects ({completedProjects.length})
        </button>
        <button 
          onClick={() => setActiveTab('lost')}
          className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'lost' ? 'bg-[#1061C3] text-white shadow-lg' : 'text-gray-400 hover:text-slate-800 dark:hover:text-white'}`}
        >
          Lost Projects ({lostProjects.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
        {activeTab === 'completed' ? (
          completedProjects.length > 0 ? (
            completedProjects.map(p => <ArchivedCard key={p.id} project={p} onRestore={handleRestore} canSeeFinancials={canSeeFinancials} />)
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-300 dark:text-slate-700 font-black uppercase italic tracking-widest">No completed projects in archive.</p>
            </div>
          )
        ) : (
          lostProjects.length > 0 ? (
            lostProjects.map(p => <ArchivedCard key={p.id} project={p} onRestore={handleRestore} canSeeFinancials={canSeeFinancials} />)
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-300 dark:text-slate-700 font-black uppercase italic tracking-widest">No lost projects in archive.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ProjectArchive;
