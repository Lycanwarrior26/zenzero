
import React, { useState, useMemo } from 'react';
import { AppState, BudgetAllocation, AIReallocationResponse, DailyRecord } from '../types';
import { getDailyReallocation } from '../geminiService';
import { Sparkles, Loader2, History, ChevronRight } from 'lucide-react';

interface Props {
  state: AppState;
  onComplete: (record: DailyRecord) => void;
  onUpdateAllocations: (a: BudgetAllocation) => void;
}

const DailyCheckIn: React.FC<Props> = ({ state, onComplete, onUpdateAllocations }) => {
  const [step, setStep] = useState(1);
  
  const categoriesToShow = useMemo(() => {
    return state.categories.map(cat => ({
      ...cat,
      displayLabel: (cat.classification === 'bill' || cat.classification === 'debt')
        ? `${cat.name.toUpperCase()} ($${cat.budgeted})`
        : cat.name.toUpperCase()
    }));
  }, [state.categories]);

  const [breakdown, setBreakdown] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AIReallocationResponse | null>(null);

  const totalSpent = useMemo(() => {
    return (Object.values(breakdown) as number[]).reduce((sum, val) => sum + (val || 0), 0);
  }, [breakdown]);

  const handleNext = async () => {
    if (step === 1) {
      setLoading(true);
      try {
        const result = await getDailyReallocation(state, totalSpent);
        setSuggestion(result);
        setStep(2);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    } else {
      const dailyRecord: DailyRecord = {
        date: new Date().toISOString().split('T')[0],
        spent: totalSpent,
        saved: state.allocations.savings,
        checkInCompleted: true,
        breakdown: Object.entries(breakdown)
          .filter(([_, amt]) => Number(amt) > 0)
          .map(([categoryId, amount]) => {
            const cat = state.categories.find(c => c.id === categoryId);
            return { 
              category: cat?.name || 'Misc', 
              amount: Number(amount)
            };
          })
      };
      if (suggestion) onUpdateAllocations(suggestion.newAllocations);
      onComplete(dailyRecord);
    }
  };

  return (
    <div className="p-8 md:p-14 min-h-[550px] dark:bg-slate-900 transition-colors">
      {step === 1 && (
        <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-500">
          <div className="flex items-start justify-between border-b border-slate-50 dark:border-slate-800 pb-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/40 rounded-[1.5rem] flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner border border-indigo-100/50 dark:border-indigo-900/30">
                <History size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">Daily Recap</h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.25em] mt-2">Yesterday's Spending</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-1 opacity-60">Total</p>
              <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter leading-none">${totalSpent.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {categoriesToShow.map(cat => (
              <div key={cat.id} className="relative bg-slate-50/50 dark:bg-slate-800/50 p-7 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-indigo-400 focus-within:shadow-2xl transition-all duration-300 group">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] block mb-4 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                  {cat.displayLabel}
                </label>
                <div className="relative flex items-center">
                  <span className="text-3xl font-black text-slate-300 dark:text-slate-700 mr-2">$</span>
                  <input 
                    type="number"
                    value={breakdown[cat.id] || ''}
                    onChange={(e) => setBreakdown({...breakdown, [cat.id]: Number(e.target.value)})}
                    className="w-full bg-transparent text-4xl font-black text-slate-900 dark:text-slate-100 focus:outline-none placeholder:text-slate-200 dark:placeholder:text-slate-800"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6">
            <button 
              onClick={handleNext}
              disabled={loading}
              className={`w-full py-7 rounded-[2.5rem] font-black tracking-tight transition-all flex items-center justify-center gap-5 shadow-2xl ${
                loading 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-800 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  <span className="text-xl">Calculating Alignment...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">Calculate Alignment</span>
                  <ChevronRight size={28} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 2 && suggestion && (
        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center">
            <div className="inline-block p-6 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl dark:shadow-none mb-8">
              <Sparkles size={44} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Zen Alignment</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-[0.4em]">AI Adjusted Your Flow</p>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <AllocationCard label="Bills" oldVal={state.allocations.bills} newVal={suggestion.newAllocations.bills} />
            <AllocationCard label="Savings" oldVal={state.allocations.savings} newVal={suggestion.newAllocations.savings} />
            <AllocationCard label="Spendable" oldVal={state.allocations.spendable} newVal={suggestion.newAllocations.spendable} />
            <AllocationCard label="Next Goal" oldVal={state.goal.current} newVal={state.goal.current + (suggestion.newAllocations.savings - state.allocations.savings)} />
          </div>

          <div className="bg-slate-900 dark:bg-indigo-950 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group border-4 border-slate-800 dark:border-indigo-900">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles size={20} className="text-indigo-400" />
                <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.25em]">AI Analysis</span>
              </div>
              <p className="text-lg text-slate-300 dark:text-indigo-200 leading-relaxed italic font-medium">
                "{suggestion.explanation}"
              </p>
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleNext}
              className="w-full py-7 bg-emerald-600 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl dark:shadow-none hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-4"
            >
              Confirm New Path <ChevronRight size={32} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AllocationCard = ({ label, oldVal, newVal }: { label: string, oldVal: number, newVal: number }) => {
  const diff = newVal - oldVal;
  return (
    <div className="p-7 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300">
      <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">{label}</p>
      <div className="flex items-baseline gap-2 flex-wrap">
        <p className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">${newVal.toLocaleString()}</p>
        {diff !== 0 && (
          <span className={`text-[10px] font-black px-3 py-1.5 rounded-full ${diff > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'}`}>
            {diff > 0 ? '+' : ''}{diff.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default DailyCheckIn;
