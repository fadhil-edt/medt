
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../lib/ProjectContext';
import { Loader2, Mail, Info, ArrowRight, Lock, UserCircle } from 'lucide-react';

const MetaLogo = () => (
  <div className="w-full h-full bg-[#000aff] rounded-[2.5rem] p-4 flex flex-col items-center justify-center shadow-2xl">
    <svg viewBox="0 0 100 100" className="w-24 h-24 mb-1">
      {/* Plug Icon */}
      <path d="M25 42H40M25 58H40" stroke="white" strokeWidth="6" strokeLinecap="square" />
      <path d="M40 30C40 30 58 30 58 50C58 70 40 70 40 70" fill="white" />
      <rect x="68" y="42" width="16" height="16" fill="white" />
      <path d="M58 50H68" stroke="white" strokeWidth="4" />
    </svg>
    <div className="text-white text-center font-sans tracking-tighter">
      <div className="text-[6px] font-black uppercase tracking-[0.2em] mb-0.5 italic opacity-90">Plug Into The</div>
      <div className="text-2xl font-black italic tracking-tighter leading-none">META</div>
    </div>
  </div>
);

const Login: React.FC = () => {
  const { login } = useProjects();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!emailOrUser || !password) throw new Error('All fields are required.');
      await login(emailOrUser, password);
      navigate('/my-tasks');
    } catch (err: any) {
      setError(err.message || 'Identity verification failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] dark:bg-slate-950 p-6 relative overflow-hidden font-sans">
      {/* Themed Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-400/10 dark:bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl rounded-[3.5rem] p-10 md:p-14 shadow-[0_40px_80px_-15px_rgba(0,10,255,0.15)] border border-white dark:border-slate-800">
          <div className="flex flex-col items-center text-center mb-10">
            {/* BRAND LOGO - Custom Reconstructed SVG from User Image */}
            <div className="w-40 h-40 mb-10 transition-all hover:scale-105 hover:rotate-1 duration-500">
              <MetaLogo />
            </div>
            
            <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">ME-DT</h1>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-3">My Essential Deadline Tracker</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email / Username</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 transition-colors group-focus-within:text-blue-500">
                    <Mail className="w-full h-full" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="name@weareedt.com"
                    value={emailOrUser}
                    onChange={(e) => setEmailOrUser(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-14 pr-6 py-5 rounded-3xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none transition-all font-bold text-slate-800 dark:text-white shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 transition-colors group-focus-within:text-blue-500">
                    <Lock className="w-full h-full" />
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-14 pr-6 py-5 rounded-3xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none transition-all font-bold text-slate-800 dark:text-white shadow-inner"
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.25em] shadow-xl flex items-center justify-center gap-4 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verify Identity
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-500 p-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-4 animate-in slide-in-from-top-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                {error}
              </div>
            )}
          </form>

          <div className="mt-12 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100/50 dark:border-blue-900/20">
            <div className="flex gap-4">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div className="text-[10px] font-bold text-blue-600/80 dark:text-blue-400 leading-relaxed uppercase tracking-wider">
                This workspace is protected by Meta-level encryption. Access is logged.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-50">Authorized Personnel Only</p>
        </div>
      </div>


    </div>
  );
};

export default Login;
