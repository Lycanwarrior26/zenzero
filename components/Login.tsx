
import React, { useState, useMemo, useEffect } from 'react';
import { Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, Eye, EyeOff, CheckCircle2, XCircle, ChevronLeft, Sparkles, Send, RefreshCcw, ShieldAlert } from 'lucide-react';

interface Props {
  onLogin: (name: string, email: string) => void;
  returningUser?: { name: string; email: string; image?: string };
}

// Mock Database Interface
interface MockUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; 
  emailVerified: boolean; // New: Verification flag
  resetToken?: string;
  resetTokenExpiry?: number;
}

const LotusLogo = () => (
  <div className="w-24 h-24 mb-6 transform hover:scale-105 transition-transform duration-500 drop-shadow-[0_20px_40px_rgba(45,106,79,0.25)]">
    <div className="w-full h-full bg-gradient-to-br from-[#2d6a4f] to-[#081c15] rounded-[2.5rem] flex items-center justify-center p-5 border-2 border-white/10 overflow-hidden relative">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:10px_10px]" />
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-lg z-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 20 C65 35 85 45 85 65 C85 80 75 85 50 85 C25 85 15 80 15 65 C15 45 35 35 50 20 Z" fill="white" fillOpacity="0.05" />
        <path d="M50 35 C60 45 75 55 75 70 C75 80 65 82 50 82 C35 82 25 80 25 70 C25 55 40 45 50 35 Z" />
        <path d="M50 50 C55 58 65 62 65 75 C65 80 60 81 50 81 C40 81 35 80 35 75 C35 62 45 58 50 50 Z" />
      </svg>
    </div>
  </div>
);

const Login: React.FC<Props> = ({ onLogin, returningUser }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset' | 'verify_pending'>('login');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState(returningUser?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState(''); 

  // Password validation logic
  const passwordCriteria = {
    length: password.length >= 8,
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    number: /[0-9]/.test(password),
    match: mode === 'signup' || mode === 'reset' ? (password === confirmPassword && password !== '') : true
  };

  const isValid = useMemo(() => {
    if (mode === 'signup') return passwordCriteria.length && passwordCriteria.symbol && passwordCriteria.number && passwordCriteria.match && firstName && email;
    if (mode === 'login') return email && password;
    if (mode === 'forgot') return email;
    if (mode === 'reset') return passwordCriteria.length && passwordCriteria.symbol && passwordCriteria.number && passwordCriteria.match;
    if (mode === 'verify_pending') return true;
    return false;
  }, [mode, passwordCriteria, firstName, email]);

  const mockHash = (str: string) => btoa(`zen_${str}_hash`);
  const mockCompare = (plain: string, hashed: string) => mockHash(plain) === hashed;

  const handleResendVerification = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setSuccessMsg("A new verification link has been sent to your email.");
      setIsSubmitting(false);
    }, 1000);
  };

  const simulateVerification = () => {
    // Helper to simulate the user clicking the email link
    const users: MockUser[] = JSON.parse(localStorage.getItem('zenzero_users') || '[]');
    const normalizedEmail = email.toLowerCase().trim();
    const userIndex = users.findIndex(u => u.email === normalizedEmail);
    if (userIndex !== -1) {
      users[userIndex].emailVerified = true;
      localStorage.setItem('zenzero_users', JSON.stringify(users));
      setSuccessMsg("Email successfully verified! You can now log in.");
      setMode('login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const users: MockUser[] = JSON.parse(localStorage.getItem('zenzero_users') || '[]');
        const normalizedEmail = email.toLowerCase().trim();

        if (mode === 'signup') {
          if (users.some(u => u.email === normalizedEmail)) {
            throw new Error('Email already exists');
          }
          const newUser: MockUser = { 
            id: Date.now().toString(), 
            name: firstName, 
            email: normalizedEmail, 
            passwordHash: mockHash(password),
            emailVerified: false // Enforce verification on signup
          };
          users.push(newUser);
          localStorage.setItem('zenzero_users', JSON.stringify(users));
          
          setMode('verify_pending');
          setSuccessMsg("Account created! Please verify your email to continue.");
          setIsSubmitting(false);
        } 
        else if (mode === 'login') {
          const user = users.find(u => u.email === normalizedEmail);
          if (!user || !mockCompare(password, user.passwordHash)) {
            throw new Error('Invalid email or password');
          }

          // ENFORCE EMAIL VERIFICATION
          if (!user.emailVerified) {
            setMode('verify_pending');
            throw new Error('Verify your email before logging in!');
          }
          
          if (rememberMe) {
            localStorage.setItem('zenzero_auth_token', btoa(JSON.stringify({ id: user.id, exp: Date.now() + 2592000000 })));
          }
          onLogin(user.name, user.email);
        }
        else if (mode === 'forgot') {
          const userIndex = users.findIndex(u => u.email === normalizedEmail);
          if (userIndex !== -1) {
            const token = Math.random().toString(36).substring(2, 10).toUpperCase();
            users[userIndex].resetToken = token;
            users[userIndex].resetTokenExpiry = Date.now() + 3600000;
            localStorage.setItem('zenzero_users', JSON.stringify(users));
            console.log(`[SIMULATION] Reset Link sent: token=${token}`);
          }
          setSuccessMsg('If the email exists, a reset code has been sent.');
          setIsSubmitting(false);
        }
        else if (mode === 'reset') {
          const userIndex = users.findIndex(u => u.resetToken === resetTokenInput && (u.resetTokenExpiry || 0) > Date.now());
          if (userIndex === -1) {
            throw new Error('Token expired or invalid');
          }
          users[userIndex].passwordHash = mockHash(password);
          users[userIndex].resetToken = undefined;
          users[userIndex].resetTokenExpiry = undefined;
          localStorage.setItem('zenzero_users', JSON.stringify(users));
          setSuccessMsg('Password updated successfully. Please log in.');
          setMode('login');
          setIsSubmitting(false);
        }
      } catch (err: any) {
        setError(err.message);
        setIsSubmitting(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-['Plus_Jakarta_Sans']">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10 flex flex-col items-center">
          <LotusLogo />
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">
            ZenZero
          </h1>
          <p className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mb-3">BY FORGEVYN</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Budget with Clarity. Save with Purpose.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_30px_80px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-500">
          
          {(mode === 'login' || mode === 'signup') && (
            <div className="flex bg-slate-50 dark:bg-slate-800/50 p-2 m-4 rounded-3xl">
              <button 
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-md' : 'text-slate-400'}`}
              >
                Log In
              </button>
              <button 
                onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-md' : 'text-slate-400'}`}
              >
                Sign Up
              </button>
            </div>
          )}

          {(mode === 'forgot' || mode === 'reset' || mode === 'verify_pending') && (
            <div className="px-10 pt-8 flex items-center gap-4">
              <button onClick={() => setMode('login')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-indigo-600 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {mode === 'forgot' ? 'Reset Password' : mode === 'verify_pending' ? 'Verify Email' : 'Set New Password'}
              </h2>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-10 pt-4 space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-bold border border-rose-100 dark:border-rose-900/50 flex items-center gap-3 animate-in shake duration-300">
                {mode === 'verify_pending' ? <ShieldAlert size={18} /> : <XCircle size={18} />}
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-3 animate-in fade-in duration-300">
                <CheckCircle2 size={18} />
                {successMsg}
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">First Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                    <UserIcon size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="block w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all placeholder:text-slate-200"
                    placeholder="Your Name"
                  />
                </div>
              </div>
            )}

            {mode === 'verify_pending' && (
              <div className="space-y-6 text-center py-4">
                <div className="mx-auto w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                  <Mail size={32} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium px-4">
                  We've sent a verification link to <span className="font-bold text-indigo-600">{email}</span>. Please click it to activate your account.
                </p>
                <div className="space-y-3 pt-4">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-colors"
                  >
                    <RefreshCcw size={14} className={isSubmitting ? 'animate-spin' : ''} /> Resend Verification Email
                  </button>
                  <button
                    type="button"
                    onClick={simulateVerification}
                    className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-500 transition-all"
                  >
                    Simulate: Click Verification Link
                  </button>
                </div>
              </div>
            )}

            {(mode !== 'reset' && mode !== 'verify_pending') && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all placeholder:text-slate-200"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
            )}

            {mode === 'reset' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Reset Code (Check Console)</label>
                <input
                  type="text"
                  required
                  value={resetTokenInput}
                  onChange={(e) => setResetTokenInput(e.target.value)}
                  className="block w-full px-6 py-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900 rounded-2xl text-indigo-900 dark:text-indigo-200 font-mono text-sm tracking-widest"
                  placeholder="CODE"
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{mode === 'reset' ? 'New Password' : 'Password'}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-14 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all placeholder:text-slate-200"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-300 hover:text-indigo-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {(mode === 'signup' || mode === 'reset') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Confirm {mode === 'reset' ? 'New ' : ''}Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`block w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none transition-all ${passwordCriteria.match ? 'border-slate-100 dark:border-slate-800 focus:ring-indigo-500/20' : 'border-rose-300 dark:border-rose-900/50'}`}
                    placeholder="Confirm password"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2 px-2">
                  <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-wider ${passwordCriteria.length ? 'text-emerald-500' : 'text-slate-300'}`}>
                    <CheckCircle2 size={12} /> 8+ Characters
                  </div>
                  <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-wider ${passwordCriteria.symbol ? 'text-emerald-500' : 'text-slate-300'}`}>
                    <CheckCircle2 size={12} /> Special Symbol
                  </div>
                  <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-wider ${passwordCriteria.number ? 'text-emerald-500' : 'text-slate-300'}`}>
                    <CheckCircle2 size={12} /> Includes Number
                  </div>
                  <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-wider ${passwordCriteria.match ? 'text-emerald-500' : 'text-slate-300'}`}>
                    <CheckCircle2 size={12} /> Passwords Match
                  </div>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between px-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer" 
                  />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Remember Me</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                  className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {mode !== 'verify_pending' && (
              <div className="pt-2 relative">
                <div className="absolute inset-x-4 inset-y-8 bg-blue-500/20 blur-2xl rounded-full opacity-50 pointer-events-none" />
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className={`group relative w-full py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white rounded-2xl font-black shadow-[0_15px_30px_-5px_rgba(79,70,229,0.4)] flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.98] transition-all z-10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">
                        {mode === 'login' ? 'Enter Zen' : 
                         mode === 'signup' ? 'Begin Journey' : 
                         mode === 'forgot' ? 'Send Reset Code' : 'Update Password'}
                      </span>
                      {mode === 'forgot' ? <Send size={20} /> : <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />}
                    </>
                  )}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            )}

            {mode === 'forgot' && (
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 flex items-start gap-3">
                <Sparkles size={16} className="text-indigo-400 mt-1 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Enter your email to receive a recovery code. Once received, you can set a new password.
                  </p>
                  <button type="button" onClick={() => setMode('reset')} className="text-[10px] text-indigo-600 font-black underline decoration-2 underline-offset-2">Already have a code? Reset here</button>
                </div>
              </div>
            )}
          </form>
        </div>
        
        <div className="mt-12 flex flex-col items-center gap-4">
           <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800">
             <ShieldCheck size={14} className="text-emerald-500" />
             <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">Secure Encryption Enabled</p>
           </div>
           <p className="text-[8px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em]">ZenZero by FORGEVYN</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
