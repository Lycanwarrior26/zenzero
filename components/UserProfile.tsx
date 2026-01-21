
import React, { useState, useRef } from 'react';
import { AppState } from '../types';
import { BADGE_DEFINITIONS } from '../App';
import { 
  ChevronLeft, Pencil, User, Mail, Award, Database, LogOut, 
  Save, Moon, Sun, Camera, Settings, Check, Shield, Key, 
  ChevronRight, Lock, Smartphone, Trophy, Star
} from 'lucide-react';

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
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived stats from state
  const badgesWonCount = state.badges.length; 
  const checkinsCount = state.history.filter(h => h.checkInCompleted).length;

  const handleSaveName = () => {
    onUpdateUserName(tempName);
    setIsEditingName(false);
  };

  const handleSaveAll = () => {
    onUpdateUserName(tempName);
    setIsEditingName(false);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
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
    if (confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem('zenzero_state');
      sessionStorage.removeItem('zenzero_session_active');
      window.location.reload();
    }
  };

  const allBadgeDefinitions = Object.values(BADGE_DEFINITIONS);

  return (
    <div className="p-8 md:p-12 animate-in slide-in-from-right-8 duration-500 bg-white dark:bg-[#0f172a] min-h-[600px] transition-colors relative">
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="absolute top-8 right-8 p-3 text-slate-400 hover:text-indigo-600 dark:hover:text-white transition"
      >
        <ChevronLeft size={32} />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <Settings className="text-indigo-600 dark:text-indigo-400" size={24} />
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Profile Settings</h2>
      </div>

      <div className="space-y-6">
        {/* User Card with Photo Upload */}
        <div className="flex items-center gap-8 p-10 bg-slate-50 dark:bg-slate-800/40 rounded-[3rem] border border-slate-200 dark:border-white/10 relative group shadow-xl dark:shadow-2xl">
          <div 
            className="relative cursor-pointer shrink-0" 
            onClick={handleImageClick}
            title="Click to upload a photo"
          >
            <div className="w-28 h-28 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl overflow-hidden border-4 border-white/10 transition-transform group-hover:scale-105">
              {state.userImage ? (
                <img src={state.userImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-black tracking-tighter">{state.userName?.charAt(0) || 'Z'}</span>
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
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2 w-full max-w-xs">
                  <input 
                    autoFocus
                    value={tempName} 
                    onChange={e => setTempName(e.target.value)}
                    className="text-4xl font-black text-slate-900 dark:text-white focus:outline-none border-b-4 border-indigo-500 bg-transparent w-full"
                  />
                  <button onClick={handleSaveName} className="p-2 bg-emerald-500 text-white rounded-xl active:scale-95 transition shadow-lg"><Save size={18} /></button>
                </div>
              ) : (
                <>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{state.userName || 'ZenUser'}</h3>
                  <button onClick={() => setIsEditingName(true)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-white transition"><Pencil size={20} /></button>
                </>
              )}
            </div>
            <p className="text-lg font-bold text-slate-500">{state.userEmail || 'user@zenzero.io'}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div 
            onClick={() => setShowBadges(true)}
            className="p-10 bg-indigo-50 dark:bg-slate-800/60 rounded-[3rem] shadow-sm flex flex-col justify-center border-b-8 border-indigo-200 dark:border-indigo-900/30 cursor-pointer hover:scale-[1.02] transition group"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400 dark:text-slate-400 mb-1 group-hover:text-indigo-600 transition-colors">Badges Won</p>
            <div className="flex items-baseline gap-2">
               <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{badgesWonCount}</p>
               <Trophy size={20} className="text-indigo-300 dark:text-indigo-800" />
            </div>
          </div>
          <div className="p-10 bg-slate-50 dark:bg-slate-800/60 rounded-[3rem] shadow-sm flex flex-col justify-center border-b-8 border-slate-200 dark:border-slate-700/50">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Check-ins</p>
            <p className="text-5xl font-black text-slate-800 dark:text-slate-200 tracking-tighter">{checkinsCount}</p>
          </div>
        </div>

        {/* Account Security Placeholder */}
        <div className="p-10 bg-slate-50 dark:bg-slate-800/40 rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-emerald-500 dark:text-emerald-400" size={20} />
            <h3 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-[0.3em]">Account Security</h3>
          </div>
          
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-6 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition group border border-slate-100 dark:border-transparent">
              <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl"><Key size={18} className="text-indigo-600 dark:text-indigo-400" /></div>
                <p className="font-bold">Change Password</p>
              </div>
              <ChevronRight size={20} className="text-slate-400 dark:text-slate-600" />
            </button>

            <div className="w-full flex items-center justify-between p-6 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-transparent">
              <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl"><Smartphone size={18} className="text-emerald-600 dark:text-emerald-400" /></div>
                <p className="font-bold">Two-Factor Auth</p>
              </div>
              <button 
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`relative w-14 h-8 rounded-full transition-colors p-1 ${twoFactorEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-4">
          <button 
            onClick={handleSaveAll}
            className={`w-full py-6 rounded-[3rem] font-black shadow-xl flex items-center justify-center gap-4 text-2xl tracking-tight transition-all active:scale-95 ${saveFeedback ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            {saveFeedback ? <><Check size={28} /> Saved!</> : <><Save size={28} /> Save Settings</>}
          </button>

          <button 
            onClick={handleLogout}
            className="w-full py-6 text-rose-500 font-black border-2 border-slate-200 dark:border-white/10 rounded-[3rem] hover:bg-rose-500/10 transition-all flex items-center justify-center gap-4 text-2xl tracking-tight group"
          >
            <LogOut size={28} className="group-hover:-translate-x-1 transition-transform" /> Sign out
          </button>
        </div>

        {/* Theme Toggle */}
        <div className="flex flex-col items-center justify-center gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
           <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black uppercase tracking-widest ${state.theme === 'light' ? 'text-indigo-600' : 'text-slate-400'}`}>Light</span>
              <button 
                onClick={onToggleTheme} 
                className={`p-4 rounded-3xl transition-all duration-300 shadow-lg ${state.theme === 'dark' ? 'bg-slate-800 text-indigo-400 scale-110' : 'bg-white text-amber-500 scale-110 border border-amber-100'}`}
              >
                {state.theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
              </button>
              <span className={`text-[10px] font-black uppercase tracking-widest ${state.theme === 'dark' ? 'text-indigo-400' : 'text-slate-400'}`}>Dark</span>
           </div>
           <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.5em] mt-2">ZenZero By Forgevyn v2.5.6</p>
        </div>
      </div>

      {/* Achievement Roadmap Modal */}
      {showBadges && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[500] p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3.5rem] max-w-4xl w-full h-[85vh] border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-500">
            <button onClick={() => setShowBadges(false)} className="absolute top-8 right-8 text-slate-400 hover:text-rose-500 transition text-2xl p-2 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center w-12 h-12">✕</button>
            
            <div className="mb-10 shrink-0">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-2xl text-amber-500">
                   <Trophy size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Achievement Roadmap</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{badgesWonCount} of {allBadgeDefinitions.length} Mastered</p>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full mt-6 overflow-hidden border border-slate-200 dark:border-slate-700">
                 <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-1000" style={{ width: `${(badgesWonCount / allBadgeDefinitions.length) * 100}%` }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                {allBadgeDefinitions.map((def) => {
                  const earnedBadge = state.badges.find(b => b.id === def.id);
                  const isEarned = !!earnedBadge;

                  return (
                    <div 
                      key={def.id} 
                      className={`relative p-6 rounded-[2.5rem] flex flex-col items-center text-center border transition-all duration-500 ${
                        isEarned 
                          ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-xl shadow-indigo-100 dark:shadow-none' 
                          : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all'
                      }`}
                    >
                      <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-5xl mb-4 transition-transform duration-500 ${isEarned ? 'bg-indigo-50 dark:bg-indigo-900/40 scale-110 shadow-lg' : 'bg-slate-200 dark:bg-slate-800'}`}>
                        {def.icon}
                        {!isEarned && (
                          <div className="absolute top-4 right-4 text-slate-400">
                             <Lock size={14} />
                          </div>
                        )}
                      </div>
                      
                      <h4 className={`text-base font-black tracking-tight mb-1 ${isEarned ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                        {def.name}
                      </h4>
                      
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Rule: {def.description}
                      </p>

                      {isEarned && earnedBadge.earnedAt && (
                        <div className="mt-auto pt-3 border-t border-indigo-50 dark:border-indigo-900/50 w-full flex items-center justify-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-tighter">
                          <Check size={12} strokeWidth={3} /> Unlocked {new Date(earnedBadge.earnedAt).toLocaleDateString()}
                        </div>
                      )}
                      
                      {isEarned && (
                        <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-2 rounded-full shadow-lg">
                          <Star size={12} fill="currentColor" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="shrink-0 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Keep tracking to unlock more legendary status badges</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
