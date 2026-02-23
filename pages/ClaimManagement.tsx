
import React, { useState, useMemo } from 'react';
import { useProjects } from '../lib/ProjectContext';
import { Wallet, ChevronRight, CheckCircle2, DollarSign, History, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClaimManagement: React.FC = () => {
  const { projects } = useProjects();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const calculateClaimProgress = (project: any) => {
    if (!project.claims || project.claims.length === 0) return 0;
    const claimedPercentage = project.claims
      .filter((m: any) => m.isClaimed)
      .reduce((sum: number, m: any) => sum + m.percentage, 0);
    return claimedPercentage;
  };

  const getClaimedAmount = (project: any) => {
    return (project.budget * (calculateClaimProgress(project) / 100));
  };

  const activeProjects = useMemo(() => 
    projects.filter(p => 
      p.project_type !== 'Internal' && 
      ['Pre Prod', 'Development', 'Closure'].includes(p.status) && 
      calculateClaimProgress(p) < 100
    ),
    [projects]
  );

  const historyProjects = useMemo(() => 
    projects.filter(p => 
      p.project_type !== 'Internal' && 
      (p.status === 'Completed' || calculateClaimProgress(p) >= 100)
    ),
    [projects]
  );

  const displayProjects = activeTab === 'active' ? activeProjects : historyProjects;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white">Claim Management</h1>
          <p className="text-gray-500 mt-1 font-medium">Track payment milestones and financial health of project operations.</p>
        </div>
        
        <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'active' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'text-gray-400 hover:text-slate-800 dark:hover:text-white'}`}
          >
            <Zap className="w-3.5 h-3.5" />
            Active ({activeProjects.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'text-gray-400 hover:text-slate-800 dark:hover:text-white'}`}
          >
            <History className="w-3.5 h-3.5" />
            History ({historyProjects.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayProjects.map(project => {
          const progress = calculateClaimProgress(project);
          const claimedAmount = getClaimedAmount(project);
          const isFullyClaimed = progress >= 100;

          return (
            <Link 
              key={project.id}
              to={`/claims/${project.id}`}
              className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border transition-all group relative overflow-hidden ${isFullyClaimed ? 'border-emerald-100 dark:border-emerald-900/30' : 'border-gray-100 dark:border-slate-800 hover:shadow-xl'}`}
            >
              {isFullyClaimed && (
                <div className="absolute top-0 right-0 p-4">
                  <div className="bg-emerald-500 text-white p-1.5 rounded-xl shadow-lg shadow-emerald-100 dark:shadow-none">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${isFullyClaimed ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500'}`}>
                    {project.client_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className={`font-black dark:text-white transition-colors ${isFullyClaimed ? 'text-slate-800' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                      {project.project_name}
                    </h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{project.client_name}</p>
                  </div>
                </div>
                {!isFullyClaimed && (
                  <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl group-hover:rotate-45 transition-all">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {isFullyClaimed ? 'Total Claimed' : 'Claim Progress'}
                  </p>
                  <p className={`text-sm font-black ${isFullyClaimed ? 'text-emerald-500' : 'text-indigo-600'}`}>{progress}%</p>
                </div>
                <div className="w-full bg-gray-50 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${isFullyClaimed ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 pt-6 border-t border-gray-50 dark:border-slate-800">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Claimed</p>
                  <p className={`text-xs font-black ${isFullyClaimed ? 'text-emerald-600' : 'text-emerald-600'}`}>RM {claimedAmount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Total Budget</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">RM {project.budget.toLocaleString()}</p>
                </div>
              </div>
            </Link>
          );
        })}
        {displayProjects.length === 0 && (
          <div className="col-span-full py-20 text-center bg-gray-50/50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-slate-800">
            <p className="text-gray-400 font-bold uppercase tracking-widest italic">
              {activeTab === 'active' ? 'No active claims remaining.' : 'Claim history is empty.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimManagement;
