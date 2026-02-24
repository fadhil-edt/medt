
import React, { useState, useRef } from 'react';
import { useProjects } from '../lib/ProjectContext';
import { Camera, User, Mail, Shield, Save, Check, ArrowLeft, Loader2, Upload, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { currentUser, updateStaff, isSyncing } = useProjects();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(currentUser?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');
  const [password, setPassword] = useState(currentUser?.password || '');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const randomizeAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setAvatarUrl(`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    await updateStaff({
      ...currentUser,
      name,
      avatar_url: avatarUrl,
      password
    });

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-slate-800 dark:hover:text-white font-black text-xs uppercase tracking-widest transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Workspace
        </button>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white">Profile Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Avatar Interaction */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="relative group mb-8">
              <div className="w-40 h-40 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-900/20 border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden relative">
                {isUploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                  </div>
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser?.name}`} alt="Avatar" className="w-full h-full" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white">{currentUser?.name}</h3>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">{currentUser?.role}</p>
            </div>

            <div className="mt-10 w-full pt-8 border-t border-gray-50 dark:border-slate-800 flex flex-col gap-4">
               <button 
                 type="button"
                 onClick={randomizeAvatar}
                 className="w-full py-4 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 transition-all flex items-center justify-center gap-2"
               >
                 <RefreshCw className="w-3.5 h-3.5" /> Randomize Avatar
               </button>
               <button 
                 type="button"
                 onClick={() => fileInputRef.current?.click()}
                 className="w-full py-4 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center gap-2"
               >
                 <Upload className="w-3.5 h-3.5" /> Upload New Photo
               </button>
               <button 
                 onClick={() => setAvatarUrl('')}
                 className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-all"
               >
                 Remove Photo
               </button>
            </div>
          </div>
        </div>

        {/* Right Column: Details Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-sm border border-gray-100 dark:border-slate-800 space-y-10">
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-2">
                 <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-500">
                    <User className="w-5 h-5" />
                 </div>
                 <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Identity Settings</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Display Name</label>
                  <input 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-slate-800 dark:text-white font-bold transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                  <div className="px-6 py-4 rounded-2xl bg-gray-100 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 font-bold border border-gray-200 dark:border-slate-800 cursor-not-allowed flex items-center gap-2">
                    <Mail className="w-4 h-4 opacity-50" />
                    {currentUser?.email}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Role</label>
                  <div className="px-6 py-4 rounded-2xl bg-gray-100 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 font-bold border border-gray-200 dark:border-slate-800 cursor-not-allowed">
                    {currentUser?.role}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Password</label>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set new password"
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-slate-800 dark:text-white font-bold transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Level</label>
                  <div className="px-6 py-4 rounded-2xl bg-gray-100 dark:bg-slate-800/50 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-xs flex items-center gap-2 border border-indigo-100 dark:border-indigo-900/30">
                    <Shield className="w-4 h-4" />
                    {currentUser?.role_type} Rank
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-50 dark:border-slate-800 flex justify-between items-center">
              <div className="flex-1">
                {isSuccess && (
                  <div className="flex items-center gap-2 text-emerald-500 animate-in slide-in-from-left-2">
                    <Check className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Cloud Profile Updated</span>
                  </div>
                )}
              </div>
              <button 
                type="submit"
                disabled={isSyncing}
                className="px-10 py-4 bg-[#1061C3] dark:bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-blue-100 dark:hover:shadow-none hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
              >
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
