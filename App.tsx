
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

const BADGE_DEFINITIONS: Record<string, Omit<Badge, 'earnedAt'>> = {
  'consistent-saver': { id: 'consistent-saver', name: 'Consistent Saver', description: '30-day daily check-in streak.', icon: '🔥' },
  'goal-crusher': { id: 'goal-crusher', name: 'Goal Crusher', description: 'Exceeded monthly savings goal.', icon: '💰' },
  'budget-master': { id: 'budget-master', name: 'Budget Master', description: 'Stayed within budget for a full week.', icon: '📊' },
  'first-check-in': { id: 'first-check-in', name: 'Early Bird', description: 'Completed your first daily check-in.', icon: '🎯' }
};

const HeaderLogo = () => (
  <div className="w-10 h-10 bg-indigo-600 rounded-xl shadow-md flex items-center justify-center p-1.5 shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M50 20 C65 35 85 45 85 65 C85 80 75 85 50 85 C25 85 15 80 15 65 C15 45 35 35 50 20 Z" />
      <path d="M50 35 C60 45 75 55 75 70 C75 80 65 82 50 82 C35 82 25 80 25 70 C25 55 40 45 50 35 Z" />
    </svg>
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

  // Check if session is already active or if we have returning credentials
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Fix: Added missing currentView state variable to handle navigation
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  
  useEffect(() => {
    if (state.userName) {
      // If we have a user name, we check if they've already "logged in" this session
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
      return { ...prev, badges: [...prev.badges, badgeWithDate] };
    });
  }, []);

  const [newBadge, setNewBadge] = useState<Badge | null>(null);

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
      awardBadge('first-check-in');
    }

    if (state.history.length >= 29) {
      const last30 = state.history.slice(-29);
      if (last30.every(h => h.checkInCompleted)) {
        awardBadge('consistent-saver');
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
