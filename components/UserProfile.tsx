
import React, { useState, useRef } from 'react';
import { AppState } from '../types';
import { ChevronLeft, Pencil, User, Mail, Award, Database, LogOut, Save, Moon, Sun, Camera } from 'lucide-react';

interface Props {
  state: AppState;
  onBack: () => void;
  onUpdateUserName: (name: string) => void;
  onUpdateUserImage: (image: string) => void;
  onToggleTheme: () => void;
}

const UserProfile: React.FC<Props> = ({ state, onBack, onUpdateUserName, onUpdateUserImage, onToggleTheme }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(state.userName || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSaved = state.history.reduce((sum, h) => sum + (h.saved || 0), 0) + state.goal.current;
  const totalDays = state.history.length;

  const handleSaveName = () => {
    onUpdateUserName(tempName);
    setIsEditingName(false);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUserImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out? Your data is saved locally.")) {
      localStorage.removeItem('zenzero_state');
      window.location.reload();
    }
  };

  const handleClearData = () => {
    if (confirm("DANGER: This will permanently delete all your budget data, categories, and history. This cannot be undone.")) {
      localStorage.removeItem('zenzero_state');
      window.location.reload();
    }
  };

  return (
    <div className="p-8 md:p-12 animate-in slide-in-from-right-8 duration-500 bg-white dark:bg-slate-900 transition-colors">
      <button 
        onClick={onBack} 
        className="mb-8 p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-2 font-bold text-sm"
      >
        <ChevronLeft size={18} /> Back to Dashboard
      </button>

      <div className="space-y-10">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group cursor-pointer" onClick={handleImageClick}>
            <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100/50 dark:shadow-none overflow-hidden border-4 border-white dark:border-slate-800 transition-all group-hover:border-indigo-500">
              {state.userImage ? (
                <img src={state.userImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} strokeWidth={1.5} />
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-[2.5rem] flex items-center justify-center transition-opacity">
              <Camera size={24} className="text-white" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
          
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2 w-full max-w-xs">
                  <input 
                    autoFocus
                    value={tempName} 
                    onChange={e => setTempName(e.target.value)}
                    className="text-2xl font-black text-slate-900 dark:text-slate-100 focus:outline-none border-b-2 border-indigo-500 bg-transparent w-full"
                  />
                  <button onClick={handleSaveName} className="p-2 bg-emerald-500 text-white rounded-lg shrink-0 active:scale-95 transition"><Save size={16} /></button>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{state.userName || 'Zen User'}</h2>
                  <button onClick={() => setIsEditingName(true)} className="p-2 text-slate-300 dark:text-slate-600 hover:text-indigo-500 transition"><Pencil size={18} /></button>
                </>
              )}
            </div>
            <p className="text-sm font-bold text-slate-400 flex items-center justify-center sm:justify-start gap-2">
              <Mail size={14} /> {state.userEmail || 'zenuser@zenzero.io'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Impact</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">${totalSaved.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 italic">Saved & goals reached</p>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Journey Length</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{totalDays} Days</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 italic">Active streaks</p>
          </div>
        </div>

        {/* Theme Settings Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Moon size={20} className="text-indigo-500" />
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Display Theme</h3>
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className={`p-3 rounded-2xl ${state.theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-600'}`}>
                 {state.theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
               </div>
               <div>
                 <p className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight text-sm">
                   {state.theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
                 </p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Switch app appearance</p>
               </div>
            </div>
            <button 
              onClick={onToggleTheme}
              className={`relative w-14 h-8 rounded-full transition-colors flex items-center px-1 ${state.theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${state.theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </section>

        {/* Badges Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Award size={20} className="text-amber-500" />
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Achievements Won</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {state.badges.length > 0 ? state.badges.map(badge => (
              <div key={badge.id} className="p-5 bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900/30 rounded-[2.5rem] flex flex-col items-center text-center space-y-3 group hover:shadow-2xl hover:shadow-amber-100 dark:hover:shadow-none transition-all cursor-default border-b-4 border-b-amber-500/20">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/10 rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                  {badge.icon}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{badge.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase leading-tight">{badge.description}</p>
                </div>
              </div>
            )) : (
              <p className="col-span-full text-center py-10 text-slate-400 dark:text-slate-600 font-bold italic border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                No achievements yet. Complete check-ins to unlock.
              </p>
            )}
          </div>
        </section>

        {/* Data & Account Adjustments */}
        <section className="space-y-4 pt-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Database size={20} className="text-indigo-500" /> Adjustments & Data
          </h3>
          <div className="space-y-3">
            <button 
              onClick={handleLogout}
              className="w-full p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-500 transition shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition">
                  <LogOut size={20} />
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800 dark:text-slate-200">Secure Logout</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ends current session</p>
                </div>
              </div>
              <ChevronLeft className="rotate-180 text-slate-300 dark:text-slate-600" size={20} />
            </button>

            <button 
              onClick={handleClearData}
              className="w-full p-5 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-[2.5rem] flex items-center justify-between group hover:bg-rose-100 dark:hover:bg-rose-900/30 transition shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-600 text-white rounded-xl">
                  <XIcon size={20} />
                </div>
                <div className="text-left">
                  <p className="font-black text-rose-800 dark:text-rose-400">Wipe All Data</p>
                  <p className="text-[10px] font-bold text-rose-400 dark:text-rose-600 uppercase tracking-widest">Factory reset app</p>
                </div>
              </div>
              <ChevronLeft className="rotate-180 text-rose-300 dark:text-rose-700" size={20} />
            </button>
          </div>
        </section>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">ZenZero Financial OS v1.1.0</p>
      </div>
    </div>
  );
};

// Internal icon helper to avoid name clash
const XIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default UserProfile;
