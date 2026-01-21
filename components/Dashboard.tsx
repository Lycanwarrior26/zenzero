
import React, { useState, useMemo } from 'react';
import { ViewType, AppState, BudgetCategory, IncomeSource, Goal } from '../types';
import { 
  CheckCircle, 
  ArrowRight, 
  Target, 
  BarChart3, 
  Plus, 
  PlusCircle, 
  MinusCircle, 
  X,
  Settings,
  Trash2,
  Banknote,
  Zap,
  Pencil,
  RotateCcw,
  AlertTriangle,
  Flame,
  TrendingUp
} from 'lucide-react';

interface Props {
  state: AppState;
  setView: (v: ViewType) => void;
  onLogActivity: (type: 'spending' | 'income' | 'savings', amount: number, categoryId?: string) => void;
  onUpdateCategories: (categories: BudgetCategory[]) => void;
  onUpdateIncome: (income: IncomeSource[]) => void;
  onUpdateGoal: (goal: Goal) => void;
  onResetActivity: () => void;
}

type ViewMode = 'weekly' | 'biweekly' | 'monthly';

const Dashboard: React.FC<Props> = ({ state, setView, onLogActivity, onUpdateCategories, onUpdateIncome, onUpdateGoal, onResetActivity }) => {
  const { allocations, goal, categories, incomeSources, userName } = state;
  
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [logStep, setLogStep] = useState<1 | 2>(1);
  const [logType, setLogType] = useState<'spending' | 'income' | 'savings' | null>(null);
  const [logAmount, setLogAmount] = useState('');
  const [logCategoryId, setLogCategoryId] = useState<string>('');

  const [showEditCategories, setShowEditCategories] = useState(false);
  const [tempCategories, setTempCategories] = useState<BudgetCategory[]>([]);

  const [showEditIncome, setShowEditIncome] = useState(false);
  const [tempIncome, setTempIncome] = useState<IncomeSource[]>([]);

  const [showEditGoal, setShowEditGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState<Goal>({ ...goal });

  const progressPercent = Math.min(100, Math.round((goal.current / (goal.target || 1)) * 100));

  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const toWeekly = (amount: number, freq: 'weekly' | 'biweekly' | 'monthly') => {
    if (freq === 'weekly') return amount;
    if (freq === 'biweekly') return amount / 2;
    if (freq === 'monthly') return amount / 4;
    return amount;
  };

  const fromWeekly = (weeklyAmount: number, mode: ViewMode) => {
    if (mode === 'weekly') return weeklyAmount;
    if (mode === 'biweekly') return weeklyAmount * 2;
    if (mode === 'monthly') return weeklyAmount * 4;
    return weeklyAmount;
  };

  const calculatedAllocations = useMemo(() => {
    const totalWeeklyIncome = incomeSources.reduce((sum, source) => sum + toWeekly(source.amount, source.frequency), 0);
    const totalBudgetedWeekly = categories.reduce((sum, c) => sum + toWeekly(c.budgeted, c.frequency), 0);
    const savingsWeekly = allocations.savings;
    const remainingToAssignWeekly = totalWeeklyIncome - totalBudgetedWeekly - savingsWeekly;

    return {
      totalBudgetedWeekly,
      remainingToAssignWeekly,
      totalWeeklyIncome
    };
  }, [incomeSources, categories, allocations.savings]);

  const remainingToAssign = fromWeekly(calculatedAllocations.remainingToAssignWeekly, viewMode);
  const isZeroBalanced = Math.abs(remainingToAssign) < 0.01;

  const resetLog = () => {
    setShowQuickLog(false);
    setLogStep(1);
    setLogType(null);
    setLogAmount('');
    setLogCategoryId('');
  };

  const handleQuickLog = () => {
    const amount = parseFloat(logAmount);
    if (!logType || isNaN(amount) || amount <= 0) return;
    onLogActivity(logType, amount, logType === 'spending' ? logCategoryId : undefined);
    resetLog();
  };

  const handleResetActivity = () => {
    if (confirm("Reset all activity for today?")) {
      onResetActivity();
      resetLog();
    }
  };

  const openEditCategories = () => {
    setTempCategories([...categories]);
    setShowEditCategories(true);
  };

  const handleSaveCategories = () => {
    onUpdateCategories(tempCategories);
    setShowEditCategories(false);
  };

  const updateTempCategory = (id: string, updates: Partial<BudgetCategory>) => {
    setTempCategories(tempCategories.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeTempCategory = (id: string) => {
    setTempCategories(tempCategories.filter(c => c.id !== id));
  };

  const addTempCategory = () => {
    const newId = `c${Date.now()}`;
    setTempCategories([...tempCategories, { 
      id: newId, 
      name: '', 
      budgeted: 0, 
      spent: 0, 
      frequency: 'weekly', 
      classification: 'movable' 
    }]);
  };

  const openEditIncome = () => {
    setTempIncome([...incomeSources]);
    setShowEditIncome(true);
  };

  const handleSaveIncome = () => {
    onUpdateIncome(tempIncome);
    setShowEditIncome(false);
  };

  const updateTempIncome = (id: string, updates: Partial<IncomeSource>) => {
    setTempIncome(tempIncome.map(inc => inc.id === id ? { ...inc, ...updates } : inc));
  };

  const removeTempIncome = (id: string) => {
    setTempIncome(tempIncome.filter(inc => inc.id !== id));
  };

  const addTempIncome = () => {
    const newId = `inc${Date.now()}`;
    setTempIncome([...tempIncome, { 
      id: newId, 
      name: '', 
      amount: 0, 
      frequency: 'monthly' 
    }]);
  };

  const handleSaveGoal = () => {
    onUpdateGoal(tempGoal);
    setShowEditGoal(false);
  };

  const getEstPayoffDate = (remainingBalance: number, budgeted: number, freq: string) => {
    const weeklyPayment = toWeekly(budgeted, freq as any);
    if (weeklyPayment <= 0) return 'Never';
    const monthlyPayment = weeklyPayment * 4;
    const monthsLeft = Math.ceil(remainingBalance / monthlyPayment);
    const date = new Date();
    date.setMonth(date.getMonth() + monthsLeft);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-6 space-y-8 relative dark:bg-slate-900 transition-colors">
      <section className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {greeting}, <span className="text-indigo-600 dark:text-indigo-400">{userName || 'User'}</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic mt-1">"Every dollar deserves a purpose."</p>
        </div>
        <button onClick={() => setShowQuickLog(true)} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-105 transition-transform active:scale-95">
          <Plus size={24} />
        </button>
      </section>

      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        {(['weekly', 'biweekly', 'monthly'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
              viewMode === mode ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <section className={`p-6 rounded-[2.5rem] border flex flex-col gap-3 transition-all duration-500 shadow-xl ${isZeroBalanced ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-400'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isZeroBalanced ? <CheckCircle size={28} className="text-emerald-500" /> : <AlertTriangle size={28} className="text-amber-500" />}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Status</p>
              <p className="text-4xl font-black tracking-tighter">${remainingToAssign.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase opacity-60">Status</p>
            <p className="text-sm font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">UNASSIGNED</p>
          </div>
        </div>
        {!isZeroBalanced && (
          <div className="py-2 px-4 rounded-2xl border border-current border-opacity-10 text-[11px] font-bold flex items-center gap-2 bg-amber-100/50 dark:bg-amber-900/40">
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            Assign every dollar to reach a zero balance.
          </div>
        )}
      </section>

      <section className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-2">
             <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Banknote size={20} />
             </div>
             <h4 className="text-[10px] font-black text-gray-800 dark:text-slate-200 uppercase tracking-widest">Income & Savings ({viewMode})</h4>
           </div>
           <button onClick={openEditIncome} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-[10px] font-black hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-1.5 border border-indigo-100 dark:border-indigo-800">
             <Settings size={12} /> ADJUST
           </button>
        </div>
        <div className="space-y-4">
          <p className="text-4xl font-black text-indigo-900 dark:text-indigo-300 tracking-tighter">${fromWeekly(calculatedAllocations.totalWeeklyIncome, viewMode).toLocaleString()}</p>
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
               <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Budgeted {viewMode}</p>
               <p className="text-lg font-black text-slate-800 dark:text-slate-200">${fromWeekly(calculatedAllocations.totalBudgetedWeekly, viewMode).toLocaleString()}</p>
             </div>
             <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
               <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{viewMode} Savings</p>
               <p className="text-lg font-black text-slate-800 dark:text-slate-200">${fromWeekly(allocations.savings, viewMode).toLocaleString()}</p>
             </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 dark:bg-indigo-950 text-white p-6 rounded-[2.5rem] relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Target size={18} className="text-indigo-300" />
              </div>
              {goal.name}
            </h3>
            <button onClick={() => setShowEditGoal(true)} className="p-2 hover:bg-white/10 rounded-lg text-indigo-300 transition-colors">
              <Pencil size={18} />
            </button>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-white/40">
            <div><p className="mb-1">Saved to Date</p><p className="text-lg text-white font-black">${goal.current.toLocaleString()}</p></div>
            <div className="text-right"><p className="mb-1">Progress</p><p className="text-lg text-indigo-400 font-black">{progressPercent}%</p></div>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 text-white/5 opacity-30"><BarChart3 size={180} /></div>
      </section>

      <section className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex justify-between items-center mb-6">
           <h4 className="text-[10px] font-black text-gray-800 dark:text-slate-200 uppercase tracking-widest">Budget Overview ({viewMode})</h4>
           <button onClick={openEditCategories} className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-black hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-2">
             <Settings size={14} /> EDIT ALL
           </button>
        </div>
        <div className="space-y-5">
          {categories.map(cat => {
            const isDebt = cat.classification === 'debt';
            const currentViewAlloc = fromWeekly(toWeekly(cat.budgeted, cat.frequency), viewMode);
            const progress = Math.min(100, ((cat.spent || 0) / (currentViewAlloc || 1)) * 100);
            
            return (
              <div key={cat.id} className="space-y-2">
                <div className="flex justify-between text-[11px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-tight">
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                      <CheckCircle size={12} className="text-emerald-500" />
                    </div>
                    {cat.name} (${currentViewAlloc.toLocaleString()})
                  </span>
                  <span>
                    <span className="text-slate-900 dark:text-slate-100">${(cat.spent || 0).toLocaleString()}</span>
                    <span className="text-slate-300 dark:text-slate-700 mx-2">/</span>
                    <span className="text-slate-500">${currentViewAlloc.toLocaleString()}</span>
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${progress > 100 ? 'bg-rose-400' : isDebt ? 'bg-amber-400' : 'bg-indigo-500'}`} style={{ width: `${progress}%` }} />
                </div>
                {isDebt && cat.totalBalance && (
                   <div className="flex justify-between text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 opacity-80">
                      <span>Est Payoff: {getEstPayoffDate(cat.totalBalance - cat.spent, cat.budgeted, cat.frequency)}</span>
                      <span>Remaining: ${(cat.totalBalance - cat.spent).toLocaleString()}</span>
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <button onClick={() => setView(ViewType.DAILY_CHECKIN)} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl hover:bg-indigo-700 transition flex items-center justify-center gap-3 active:scale-95">
        Start 2-Min Check-in <ArrowRight size={20} />
      </button>

      {/* MODALS */}
      {showQuickLog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-8 shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Log Activity</h3>
              <button onClick={resetLog} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"><X size={20} /></button>
            </div>
            {logStep === 1 ? (
              <div className="space-y-4">
                <button onClick={() => { setLogType('spending'); setLogStep(2); }} className="w-full p-4 bg-rose-50 text-rose-700 rounded-2xl flex items-center gap-4 font-black transition-colors hover:bg-rose-100">
                  <MinusCircle size={24} /> Spending
                </button>
                <button onClick={() => { setLogType('income'); setLogStep(2); }} className="w-full p-4 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center gap-4 font-black transition-colors hover:bg-emerald-100">
                  <PlusCircle size={24} /> Income
                </button>
                <button onClick={handleResetActivity} className="w-full py-3 text-rose-500 font-bold flex items-center justify-center gap-2">
                  <RotateCcw size={14} /> Clear Daily Log
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input type="number" autoFocus value={logAmount} onChange={e => setLogAmount(e.target.value)} placeholder="Amount" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-2xl font-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                {logType === 'spending' && (
                  <select value={logCategoryId} onChange={e => setLogCategoryId(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl font-bold">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setLogStep(1)} className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold">Back</button>
                  <button onClick={handleQuickLog} className="flex-2 p-4 bg-indigo-600 text-white rounded-2xl font-black">Save</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showEditGoal && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border border-white/20">
            <h3 className="text-2xl font-black mb-8">Edit Savings Goal</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Goal Name</label>
                <input type="text" value={tempGoal.name} onChange={e => setTempGoal({ ...tempGoal, name: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Amount ($)</label>
                <input type="number" value={tempGoal.target} onChange={e => setTempGoal({ ...tempGoal, target: Number(e.target.value) })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black border" />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowEditGoal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold">Cancel</button>
                <button onClick={handleSaveGoal} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditIncome && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-8 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black">Manage Income</h3>
              <button onClick={() => setShowEditIncome(false)} className="p-2 text-slate-400"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {tempIncome.map(inc => (
                <div key={inc.id} className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border flex gap-4 items-end">
                   <div className="flex-1 space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Source Name</label>
                      <input type="text" value={inc.name} onChange={e => updateTempIncome(inc.id, { name: e.target.value })} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 font-bold" />
                   </div>
                   <div className="w-28 space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Amount ($)</label>
                      <input type="number" value={inc.amount} onChange={e => updateTempIncome(inc.id, { amount: Number(e.target.value) })} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 font-black text-right" />
                   </div>
                   <button onClick={() => removeTempIncome(inc.id)} className="p-3 text-rose-500"><Trash2 size={20} /></button>
                </div>
              ))}
              <button onClick={addTempIncome} className="w-full py-4 border-2 border-dashed rounded-3xl text-indigo-500 font-bold">+ Add Income Source</button>
            </div>
            <div className="flex gap-4 pt-8">
              <button onClick={() => setShowEditIncome(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold">Cancel</button>
              <button onClick={handleSaveIncome} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black">Apply Changes</button>
            </div>
          </div>
        </div>
      )}

      {showEditCategories && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] p-8 md:p-10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20">
            <div className="flex justify-between items-center mb-8 shrink-0">
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Manage Categories</h3>
              <button onClick={() => setShowEditCategories(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {tempCategories.map(cat => (
                <div key={cat.id} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-4 relative shadow-sm">
                  {/* Redesigned Card for Mobile Clarity */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Category Name</label>
                       <input 
                         type="text" 
                         value={cat.name} 
                         onChange={e => updateTempCategory(cat.id, { name: e.target.value })} 
                         className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none" 
                         placeholder="e.g. Credit Card"
                       />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Budget ($)</label>
                        <input 
                          type="number" 
                          value={cat.budgeted} 
                          onChange={e => updateTempCategory(cat.id, { budgeted: Number(e.target.value) })} 
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 font-black text-slate-900 dark:text-slate-100 text-right focus:ring-2 focus:ring-indigo-500 outline-none" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Frequency</label>
                        <select 
                           value={cat.frequency} 
                           onChange={e => updateTempCategory(cat.id, { frequency: e.target.value as any })}
                           className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                         >
                           <option value="weekly">Weekly</option>
                           <option value="biweekly">Biweekly</option>
                           <option value="monthly">Monthly</option>
                         </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Classification</label>
                      <select 
                         value={cat.classification} 
                         onChange={e => updateTempCategory(cat.id, { classification: e.target.value as any })}
                         className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                       >
                         <option value="movable">Movable (Variable)</option>
                         <option value="bill">Fixed Bill</option>
                         <option value="debt">Debt Account</option>
                       </select>
                    </div>

                    {/* Debt Specific Acceleration Features */}
                    {cat.classification === 'debt' && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 space-y-4 mt-2">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                           <Flame size={16} />
                           <p className="text-[10px] font-black uppercase tracking-widest">Debt Acceleration</p>
                        </div>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center">
                             <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Balance ($)</label>
                             <input 
                               type="number" 
                               value={cat.totalBalance || 0} 
                               onChange={e => updateTempCategory(cat.id, { totalBalance: Number(e.target.value) })}
                               className="w-24 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl px-2 py-1 text-right font-black text-xs" 
                             />
                           </div>
                           <div className="space-y-1">
                             <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                               <span>Target Payoff Date</span>
                               <span className="text-amber-600 dark:text-amber-300">{cat.targetPayoffMonths || 0} Months</span>
                             </div>
                             <input 
                               type="range" 
                               min="1" 
                               max="60" 
                               value={cat.targetPayoffMonths || 12} 
                               onChange={e => updateTempCategory(cat.id, { targetPayoffMonths: Number(e.target.value) })}
                               className="w-full h-1 bg-amber-200 dark:bg-amber-900 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                             />
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => removeTempCategory(cat.id)} 
                    className="absolute top-4 right-4 p-2 text-rose-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button onClick={addTempCategory} className="w-full py-5 border-2 border-dashed border-indigo-200 dark:border-indigo-900 rounded-[2.5rem] text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2">
                <Plus size={20} /> Add Category
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 shrink-0 flex gap-4">
              <button onClick={() => setShowEditCategories(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-3xl font-bold">Cancel</button>
              <button onClick={handleSaveCategories} className="flex-1 py-4 bg-indigo-600 text-white rounded-3xl font-black shadow-lg shadow-indigo-100">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
