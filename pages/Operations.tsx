import React from 'react';
import { useProjects } from '../lib/ProjectContext';
import { Project, ProjectStatus } from '../types';
import { ChevronRight, Edit3, Activity, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const OpsCard: React.FC<{ project: Project }> = ({ project }) => {
  const statusMap: Record<string, string> = {
    'Pre Prod': 'bg-purple-50 text-purple-500',
    'Development': 'bg-blue-50 text-blue-500',
    'Closure': 'bg-emerald-50 text-emerald-500'
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative animate-in slide-in-from-bottom-2">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 p-0.5 border border-indigo-100 flex items-center justify-center font-black text-indigo-600">
           {project.client_name.charAt(0)}
        </div>
        <div className="flex-1">
          <h4 className="text-base font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{project.project_name}</h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{project.client_name}</p>
        </div>
        <Link to={`/projects/${project.id}`} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"><ChevronRight className="w-4 h-4" /></Link>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
          <span>Active Development</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden border border-gray-100 p-0.5">
           <div className="h-full bg-[#1061C3] rounded-full transition-all duration-700" style={{ width: `${project.progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#F4F7FE]/50 p-4 rounded-2xl border border-gray-100">
           <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Budget</p>
           <p className="text-xs font-black text-slate-800">RM {project.budget.toLocaleString()}</p>
        </div>
        <div className="bg-[#F4F7FE]/50 p-4 rounded-2xl border border-gray-100">
           <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Deadline</p>
           <p className="text-xs font-black text-slate-800">{new Date(project.delivery_date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-50">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phase</span>
        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full ${statusMap[project.status]}`}>{project.status}</span>
      </div>
    </div>
  );
};

const Operations: React.FC = () => {
  const { projects } = useProjects();
  const opsProjects = projects.filter(p => ['Pre Prod', 'Development', 'Closure'].includes(p.status));

  return (
    <div className="h-full">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Operational Delivery</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Live production tracking and job completion.</p>
        </div>
        <div className="bg-white p-1 rounded-2xl flex items-center shadow-sm border border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-2">
           Total Capacity: 84%
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {['Pre Prod', 'Development', 'Closure'].map(status => (
          <div key={status} className="space-y-6">
            <div className="flex items-center justify-between px-4 mb-2">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${status === 'Pre Prod' ? 'bg-purple-400' : status === 'Development' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                {status}
              </h2>
              <span className="text-[10px] font-black text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                {opsProjects.filter(p => p.status === status).length}
              </span>
            </div>
            <div className="space-y-8">
              {opsProjects.filter(p => p.status === status).map(project => (
                <OpsCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Operations;