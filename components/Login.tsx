
import React, { useState, useMemo } from 'react';
import { Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';

interface ReturningUser {
  name: string;
  email: string;
  image?: string;
}

interface Props {
  onLogin: (name: string, email: string) => void;
  returningUser?: ReturningUser;
}

const LotusLogo = () => (
  <div className="w-24 h-24 bg-gradient-to-br from-[#4db6ac] to-[#004d40] rounded-3xl shadow-2xl flex items-center justify-center p-3 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
    <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M50 20 C65 35 85 45 85 65 C85 80 75 85 50 85 C25 85 15 80 15 65 C15 45 35 35 50 20 Z" />
      <path d="M50 35 C60 45 75 55 75 70 C75 80 65 82 50 82 C35 82 25 80 25 70 C25 55 40 45 50 35 Z" />
      <path d="M50 50 C55 58 65 62 65 75 C65 80 60 81 50 81 C40 81 35 80 35 75 C35 62 45 58 50 50 Z" />
      <path d="M50 20 L50 85" strokeWidth="1" opacity="0.3" />
      <path d="M30 65 Q50 60 70 65" strokeWidth="1" opacity="0.3" />
    </svg>
  </div>
);

const Login: React.FC<Props> = ({ onLogin, returningUser }) => {
  const [firstName, setFirstName] = useState(returningUser?.name || '');
  const [email, setEmail] = useState(returningUser?.email || '');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullLogin, setShowFullLogin] = useState(false);

  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate auth check
    setTimeout(() => {
      onLogin(firstName || 'ZenUser', email || 'zenuser@zenzero.io');
    }, 1200);
  };

  const handleFastLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onLogin(returningUser!.name, returningUser!.email);
    }, 800);
  };

  // If we have a returning user and aren't explicitly trying to show the full form
  if (returningUser && !showFullLogin) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-50 p-4 transition-colors">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <LotusLogo />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
              ZenZero
            </h1>
            <p className="text-indigo-600 font-bold uppercase tracking-[0.3em] text-[10px]">Back in Flow</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white flex flex-col items-center">
            <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] overflow-hidden shadow-2xl mb-6 border-4 border-white">
              {returningUser.image ? (
                <img src={returningUser.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                   <UserIcon size={40} />
                </div>
              )}
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{greeting}, {returningUser.name}!</h2>
              <p className="text-sm text-slate-400 font-bold flex items-center justify-center gap-1.5 mt-1 lowercase tracking-wide">
                <ShieldCheck size={14} className="text-emerald-500" /> Secure session ready
              </p>
            </div>

            <button
              onClick={handleFastLogin}
              disabled={isSubmitting}
              className={`w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-700 active:scale-[0.98] transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Entering Zen...</span>
                </>
              ) : (
                <>
                  <span>Continue as {returningUser.name}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <button 
              onClick={() => setShowFullLogin(true)}
              className="mt-6 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
            >
              Not {returningUser.name}? Switch account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-50 p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <LotusLogo />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
            ZenZero <span className="text-indigo-600 block text-sm font-bold uppercase tracking-[0.3em] mt-2">by Forgevyn</span>
          </h1>
          <p className="text-slate-500 font-medium">Budget with Clarity. Save with Purpose.</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all"
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-4 py-5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-700 active:scale-[0.98] transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Get Started</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
            
            {returningUser && (
              <button 
                type="button"
                onClick={() => setShowFullLogin(false)}
                className="w-full text-center text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors mt-2"
              >
                Go back to Fast Login
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
