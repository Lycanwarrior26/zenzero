
import React, { useState, useEffect, useCallback } from 'react';
import { ViewType, AppState, BudgetAllocation, Badge, DailyRecord, IncomeSource, BudgetCategory, Goal } from './types';
import Dashboard from './components/Dashboard';
import DailyCheckIn from './components/DailyCheckIn';
import WeeklyReset from './components/WeeklyReset';
import MonthlyRecap from './components/MonthlyRecap';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import { User, Award, X } from 'lucide-react';

const INITIAL_STATE: AppState = {
  userName: '',
  userEmail: '',
  theme: 'light',
  allocations: {
    income: 1250,
    bills: 0,
    savings: 0,
    spendable: 1250,
    total: 1250
  },
  incomeSources: [
    { id: '1', name: 'Primary Salary', amount: 5000, frequency: 'monthly' }
  ],
  categories: [
    { id: 'c1', name: 'Rent', budgeted: 375, spent: 0, frequency: 'weekly', classification: 'bill', dueDate: '1' },
    { id: 'c2', name: 'Groceries', budgeted: 100, spent: 0, frequency: 'weekly', classification: 'movable' },
    { id: 'c3', name: 'Gas', budgeted: 75, spent: 0, frequency: 'weekly', classification: 'movable' },
    { id: 'c4', name: 'Credit Card', budgeted: 200, spent: 0, frequency: 'weekly', classification: 'debt', totalBalance: 5000, payoffMonths: 6, dueDate: '15' }
  ],
  goal: {
    name: "Emergency Fund",
    target: 5000,
    current: 1200
  },
  history: [],
  currentWeekCheckins: [false, false, false, false, false, false, false],
  badges: []
};

export const BADGE_DEFINITIONS: Record<string, Omit<Badge, 'earnedAt'>> = {
  // 🔥 Getting Started
  'first-step': { id: 'first-step', name: 'First Step', description: 'Completed your first check-in', icon: '🎯' },
  'budget-born': { id: 'budget-born', name: 'Budget Born', description: 'Created your first zero-based budget', icon: '👶' },
  'account-linked': { id: 'account-linked', name: 'Account Linked', description: 'Connected a bank or billing account', icon: '🔗' },
  'name-it-to-tame-it': { id: 'name-it-to-tame-it', name: 'Name It to Tame It', description: 'Categorized all expenses', icon: '🏷️' },
  'clarity-seeker': { id: 'clarity-seeker', name: 'Clarity Seeker', description: 'Reviewed spending for 3 days in a row', icon: '🔍' },
  // 📆 Consistency & Discipline
  '7-day-streak': { id: '7-day-streak', name: '7-Day Streak', description: 'Checked in 7 days straight', icon: '🔥' },
  '14-day-lock-in': { id: '14-day-lock-in', name: '14-Day Lock-In', description: 'Two-week check-in streak', icon: '🔐' },
  '30-day-finisher': { id: '30-day-finisher', name: '30-Day Finisher', description: 'One month of daily check-ins', icon: '🗓️' },
  'quarter-strong': { id: 'quarter-strong', name: 'Quarter Strong', description: '90 days of consistent tracking', icon: '🏗️' },
  'unshakeable': { id: 'unshakeable', name: 'Unshakeable', description: '180-day streak', icon: '⛰️' },
  // 💰 Smart Money Moves
  'zero-hero': { id: 'zero-hero', name: 'Zero Hero', description: 'Budget balanced to zero for the first time', icon: '🦸' },
  'expense-slayer': { id: 'expense-slayer', name: 'Expense Slayer', description: 'Cut one recurring bill', icon: '⚔️' },
  'no-spend-day': { id: 'no-spend-day', name: 'No-Spend Day', description: 'Logged a full day with $0 spent', icon: '🛑' },
  'needs-vs-wants': { id: 'needs-vs-wants', name: 'Needs vs Wants', description: 'Categorized 100% of expenses correctly', icon: '⚖️' },
  'bill-boss': { id: 'bill-boss', name: 'Bill Boss', description: 'Paid all bills before due date for one month', icon: '👔' },
  // 🏦 Savings & Security
  'emergency-starter': { id: 'emergency-starter', name: 'Emergency Starter', description: 'Saved your first $100', icon: '🆘' },
  'safety-net': { id: 'safety-net', name: 'Safety Net', description: 'Reached 1 month of expenses saved', icon: '🛡️' },
  'fort-builder': { id: 'fort-builder', name: 'Fort Builder', description: 'Reached 3 months of expenses saved', icon: '🏰' },
  'future-proof': { id: 'future-proof', name: 'Future-Proof', description: 'Opened a long-term savings goal', icon: '⏳' },
  'snowball-starter': { id: 'snowball-starter', name: 'Snowball Starter', description: 'Made first extra debt payment', icon: '❄️' },
  // 🚀 Growth & Goals
  'goal-getter': { id: 'goal-getter', name: 'Goal Getter', description: 'Created your first financial goal', icon: '🚀' },
  'milestone-master': { id: 'milestone-master', name: 'Milestone Master', description: 'Hit a major savings milestone', icon: '🏆' },
  'vision-builder': { id: 'vision-builder', name: 'Vision Builder', description: 'Planned finances 6 months ahead', icon: '🗺️' },
  'upgrade-mode': { id: 'upgrade-mode', name: 'Upgrade Mode', description: 'Increased income or side hustle logged', icon: '📈' },
  'freedom-path': { id: 'freedom-path', name: 'Freedom Path', description: 'Created a financial independence plan', icon: '🔓' },
  // 🧠 Awareness & Mindset
  'money-mindful': { id: 'money-mindful', name: 'Money Mindful', description: 'Reflected on spending habits for 7 days', icon: '🧘' },
  'impulse-breaker': { id: 'impulse-breaker', name: 'Impulse Breaker', description: 'Avoided a planned impulse purchase', icon: '🔨' },
  'clarity-champion': { id: 'clarity-champion', name: 'Clarity Champion', description: 'Reviewed budget weekly for 1 month', icon: '🥇' },
  'reality-check': { id: 'reality-check', name: 'Reality Check', description: 'Adjusted budget after overspending', icon: '📉' },
  'calm-under-pressure': { id: 'calm-under-pressure', name: 'Calm Under Pressure', description: 'Stayed on budget during a tough week', icon: '💎' },
  // 🎯 Mastery & Elite Tier
  'budget-architect': { id: 'budget-architect', name: 'Budget Architect', description: 'Built a full yearly budget plan', icon: '📐' },
  'cash-flow-king-queen': { id: 'cash-flow-king-queen', name: 'Cash Flow King/Queen', description: 'Positive cash flow for 3 months', icon: '👑' },
  'debt-destroyer': { id: 'debt-destroyer', name: 'Debt Destroyer', description: 'Paid off a major debt', icon: '🧨' },
  'wealth-builder': { id: 'wealth-builder', name: 'Wealth Builder', description: 'First $10,000 saved or invested', icon: '🏦' },
  'financial-athlete': { id: 'financial-athlete', name: 'Financial Athlete', description: '365-day check-in streak', icon: '🏃' },
  // 🏅 Fun & Personality Badges
  'late-night-logger': { id: 'late-night-logger', name: 'Late-Night Logger', description: 'Checked in after midnight', icon: '🌙' },
  'early-bird': { id: 'early-bird', name: 'Early Bird', description: 'Checked in before 6 AM', icon: '🌅' },
  'receipt-hoarder': { id: 'receipt-hoarder', name: 'Receipt Hoarder', description: 'Logged 50 expenses in one week', icon: '🧾' },
  'the-minimalist': { id: 'the-minimalist', name: 'The Minimalist', description: '3 no-spend days in a row', icon: '🍃' },
  'comeback-kid': { id: 'comeback-kid', name: 'Comeback Kid', description: 'Returned after 7 days inactive', icon: '🔄' },
  // 🌟 Legendary / Rare
  'zen-master': { id: 'zen-master', name: 'Zen Master', description: 'Balanced budget for 6 straight months', icon: '☯️' },
  'storm-rider': { id: 'storm-rider', name: 'Storm Rider', description: 'Stayed on budget during a financial emergency', icon: '⚡' },
  'iron-will': { id: 'iron-will', name: 'Iron Will', description: 'No impulse buys for 30 days', icon: '🦾' },
  'generosity-giver': { id: 'generosity-giver', name: 'Generosity Giver', description: 'Donated or gave consistently for a month', icon: '🎁' },
  'legacy-builder': { id: 'legacy-builder', name: 'Legacy Builder', description: 'Created estate or legacy plan', icon: '🏛️' },
  // 🧩 Hidden / Surprise Badges
  'the-phoenix': { id: 'the-phoenix', name: 'The Phoenix', description: 'Rebuilt budget after hitting zero savings', icon: '🐦' },
  'wildcard': { id: 'wildcard', name: 'Wildcard', description: 'Used a new feature for the first time', icon: '🃏' },
  'silent-grinder': { id: 'silent-grinder', name: 'Silent Grinder', description: 'Checked in for 10 days without opening badges', icon: '🤐' },
  'perfectionist': { id: 'perfectionist', name: 'Perfectionist', description: '100% accurate expense categorization for 30 days', icon: '✨' },
  'the-ascended': { id: 'the-ascended', name: 'The Ascended', description: 'Earned 25 total badges', icon: '👼' }
};

const HeaderLogo = () => (
  <div className="w-10 h-10 relative transform -rotate-6 shrink-0">
    <div className="absolute inset-0 bg-gradient-to-br from-[#4db6ac] to-[#004d40] rounded-xl border-2 border-white shadow-md shadow-emerald-900/20" />
    <div className="absolute inset-0 flex items-center justify-center p-1.5">
      <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 35 C42 45 38 60 38 75 C38 82 44 85 50 85 C56 85 62 82 62 75 C62 60 58 45 50 35 Z" fill="white" fillOpacity="0.1" />
        <path d="M38 45 C28 48 20 62 20 75 C20 80 25 82 32 82" />
        <path d="M62 45 C72 48 80 62 80 75 C80 80 75 82 68 82" />
        <path d="M42 85 C45 92 55 92 58 85" />
      </svg>
    </div>
  </div>
);

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('zenzero_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.categories)) {
          if (!parsed.theme) parsed.theme = 'light';
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading state:", e);
    }
    return INITIAL_STATE;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  
  useEffect(() => {
    if (state.userName) {
      const sessionActive = sessionStorage.getItem('zenzero_session_active');
      if (sessionActive === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, [state.userName]);

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  useEffect(() => {
    if (state.userName) {
      localStorage.setItem('zenzero_state', JSON.stringify(state));
    }
  }, [state]);

  const awardBadge = useCallback((badgeId: string) => {
    setState(prev => {
      if (prev.badges.some(b => b.id === badgeId)) return prev;
      const definition = BADGE_DEFINITIONS[badgeId];
      if (!definition) return prev;
      
      const badgeWithDate: Badge = { ...definition, earnedAt: new Date().toISOString() };
      setNewBadge(badgeWithDate);

      // Special Logic for "The Ascended"
      const currentBadgeCount = prev.badges.length + 1;
      let finalBadges = [...prev.badges, badgeWithDate];
      if (currentBadgeCount === 25 && !prev.badges.some(b => b.id === 'the-ascended')) {
          const ascendedDef = BADGE_DEFINITIONS['the-ascended'];
          finalBadges.push({ ...ascendedDef, earnedAt: new Date().toISOString() });
      }

      return { ...prev, badges: finalBadges };
    });
  }, []);

  const handleLogin = (name: string, email: string) => {
    setState(prev => ({ ...prev, userName: name, userEmail: email }));
    setIsAuthenticated(true);
    sessionStorage.setItem('zenzero_session_active', 'true');
  };

  const updateAllocations = (newAllocations: BudgetAllocation) => {
    setState(prev => ({ ...prev, allocations: newAllocations }));
  };

  const updateCategories = (newCategories: BudgetCategory[]) => {
    setState(prev => ({ ...prev, categories: newCategories }));
  };

  const updateGoal = (newGoal: Goal) => {
    setState(prev => ({ ...prev, goal: newGoal }));
  };

  const updateUserName = (name: string) => {
    setState(prev => ({ ...prev, userName: name }));
  };

  const updateUserImage = (image: string) => {
    setState(prev => ({ ...prev, userImage: image }));
  };

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const resetActivity = () => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => ({ ...c, spent: 0 })),
      allocations: {
        ...prev.allocations,
        spendable: prev.allocations.income
      }
    }));
  };

  const updateIncomeSources = (newIncomeSources: IncomeSource[]) => {
    setState(prev => {
      const totalWeeklyIncome = newIncomeSources.reduce((sum, source) => {
        if (source.frequency === 'weekly') return sum + source.amount;
        if (source.frequency === 'biweekly') return sum + (source.amount / 2);
        if (source.frequency === 'monthly') return sum + (source.amount / 4);
        return sum;
      }, 0);

      return {
        ...prev,
        incomeSources: newIncomeSources,
        allocations: {
          ...prev.allocations,
          income: totalWeeklyIncome
        }
      };
    });
  };

  const logActivity = (type: 'spending' | 'income' | 'savings', amount: number, categoryId?: string) => {
    setState(prev => {
      const todayStr = new Date().toISOString().split('T')[0];
      const newAllocations = { ...prev.allocations };
      const newHistory = [...prev.history];
      const newGoal = { ...prev.goal };
      const newCategories = [...prev.categories];

      if (type === 'income') {
        newAllocations.income += amount;
      } else if (type === 'spending') {
        if (categoryId) {
          const idx = newCategories.findIndex(c => c.id === categoryId);
          if (idx !== -1) {
            newCategories[idx] = { ...newCategories[idx], spent: (newCategories[idx].spent || 0) + amount };
          }
        }
      } else if (type === 'savings') {
        newAllocations.savings += amount;
        newGoal.current += amount;
      }

      let todayRecordIndex = newHistory.findIndex(h => h.date === todayStr);
      const catName = categoryId ? (newCategories.find(c => c.id === categoryId)?.name || 'Misc') : 'Misc';

      if (todayRecordIndex === -1) {
        newHistory.push({
          date: todayStr,
          spent: type === 'spending' ? amount : 0,
          saved: type === 'savings' ? amount : 0,
          checkInCompleted: false,
          breakdown: type === 'spending' ? [{ category: catName, amount }] : []
        });
      } else {
        const record = { ...newHistory[todayRecordIndex] };
        if (type === 'spending') {
          record.spent += amount;
          const breakdown = record.breakdown ? [...record.breakdown] : [];
          const bIdx = breakdown.findIndex(b => b.category === catName);
          if (bIdx > -1) {
            breakdown[bIdx] = { ...breakdown[bIdx], amount: breakdown[bIdx].amount + amount };
          } else {
            breakdown.push({ category: catName, amount });
          }
          record.breakdown = breakdown;
        } else if (type === 'savings') {
          record.saved += amount;
        }
        newHistory[todayRecordIndex] = record;
      }

      return {
        ...prev,
        allocations: newAllocations,
        history: newHistory,
        goal: newGoal,
        categories: newCategories
      };
    });
  };

  const completeCheckIn = (dailyRecord: DailyRecord) => {
    if (state.history.length === 0) {
      awardBadge('first-step');
    }

    if (state.history.length >= 29) {
      const last30 = state.history.slice(-29);
      if (last30.every(h => h.checkInCompleted)) {
        awardBadge('30-day-finisher');
      }
    }

    const newCheckins = [...state.currentWeekCheckins];
    const firstFalse = newCheckins.indexOf(false);
    if (firstFalse !== -1) newCheckins[firstFalse] = true;

    setState(prev => ({
      ...prev,
      currentWeekCheckins: newCheckins,
      history: prev.history.some(h => h.date === dailyRecord.date)
        ? prev.history.map(h => h.date === dailyRecord.date ? dailyRecord : h)
        : [...prev.history, dailyRecord]
    }));
    setCurrentView(ViewType.DASHBOARD);
  };

  if (!isAuthenticated) return (
    <Login 
      onLogin={handleLogin} 
      returningUser={state.userName ? { name: state.userName, email: state.userEmail || '', image: state.userImage } : undefined} 
    />
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center p-4 md:p-8 transition-colors duration-300">
      <header className="w-full max-w-2xl mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <HeaderLogo />
          <div>
            <h1 className="text-2xl font-black text-indigo-700 dark:text-indigo-400 leading-none tracking-tight">ZenZero</h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">by Forgevyn</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setCurrentView(ViewType.WEEKLY_RESET)} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition">Reset</button>
           <button onClick={() => setCurrentView(ViewType.MONTHLY_RECAP)} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition">Recap</button>
           <button 
             onClick={() => setCurrentView(ViewType.USER_PROFILE)} 
             className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full overflow-hidden text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-900 transition shadow-sm ml-1"
           >
             {state.userImage ? (
               <img src={state.userImage} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <User size={18} />
             )}
           </button>
        </div>
      </header>
      
      <main className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors duration-300 relative">
        {currentView === ViewType.DAILY_CHECKIN && <DailyCheckIn state={state} onComplete={completeCheckIn} onUpdateAllocations={updateAllocations} />}
        {currentView === ViewType.WEEKLY_RESET && <WeeklyReset state={state} awardBadge={awardBadge} onComplete={() => setCurrentView(ViewType.DASHBOARD)} />}
        {currentView === ViewType.MONTHLY_RECAP && <MonthlyRecap state={state} awardBadge={awardBadge} onComplete={(g) => { if (g) setState(p => ({ ...p, goal: g })); setCurrentView(ViewType.DASHBOARD); }} />}
        {currentView === ViewType.USER_PROFILE && <UserProfile state={state} onBack={() => setCurrentView(ViewType.DASHBOARD)} onUpdateUserName={updateUserName} onUpdateUserImage={updateUserImage} onToggleTheme={toggleTheme} />}
        {currentView === ViewType.DASHBOARD && (
          <Dashboard 
            state={state} 
            setView={setCurrentView} 
            onLogActivity={logActivity} 
            onUpdateCategories={updateCategories} 
            onUpdateIncome={updateIncomeSources} 
            onUpdateGoal={updateGoal}
            onResetActivity={resetActivity}
          />
        )}
      </main>

      {newBadge && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-800 w-full max-w-xs rounded-[3rem] p-10 shadow-2xl border-4 border-indigo-500/20 text-center animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-6xl mx-auto mb-6 shadow-xl shadow-indigo-100/50">
                {newBadge.icon}
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Achievement Unlocked!</h2>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-2">{newBadge.name}</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">{newBadge.description}</p>
              <button 
                onClick={() => setNewBadge(null)}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 active:scale-95 transition"
              >
                Awesome!
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
