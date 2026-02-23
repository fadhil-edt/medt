
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
  const [mode, setMode] = useState<'sso' | 'manual'>('sso');
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'sso') {
        if (!email) throw new Error('Workspace email is required.');
        await login(email);
      } else {
        if (!username || !password) throw new Error('All fields are required.');
        await login(username, password);
      }
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

          <div className="flex mb-10 p-1.5 bg-gray-100 dark:bg-slate-800 rounded-2xl">
            <button 
              onClick={() => { setMode('sso'); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'sso' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}
            >
              Workspace SSO
            </button>
            <button 
              onClick={() => { setMode('manual'); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'manual' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}
            >
              Admin Access
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {mode === 'sso' ? (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 transition-colors group-focus-within:text-blue-500">
                      <Mail className="w-full h-full" />
                    </div>
                    <input 
                      type="email" 
                      placeholder="name@weareedt.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-14 pr-6 py-5 rounded-3xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-400 outline-none transition-all font-bold text-slate-800 dark:text-white shadow-inner"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full group relative overflow-hidden py-5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-slate-800 dark:text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-4 transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      </svg>
                      Google SSO Login
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 transition-colors group-focus-within:text-blue-500">
                      <UserCircle className="w-full h-full" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
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
            )}

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

      {/* Demo Credentials Reveal */}
      <div className="fixed bottom-8 right-8 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 max-w-[280px] animate-in slide-in-from-right-4 duration-1000">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry Directory</p>
        </div>
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            <p className="text-[8px] font-black text-blue-500 uppercase mb-1 italic">Admin Hub Access</p>
            <p className="text-[10px] font-bold text-slate-700 dark:text-white">User: superadmin</p>
            <p className="text-[10px] font-bold text-slate-700 dark:text-white">Pass: EDT</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            <p className="text-[8px] font-black text-blue-400 uppercase mb-1 italic">Simulated SSO</p>
            <p className="text-[10px] font-bold text-slate-700 dark:text-white truncate">alice@weareedt.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
