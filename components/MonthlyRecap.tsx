
import React, { useState, useEffect } from 'react';
import { AppState, Goal, AIGoalSuggestion } from '../types';
import { suggestRevisedGoal } from '../geminiService';
import { Trophy, CheckCircle, XCircle, ThumbsUp, ThumbsDown, Sparkles, Loader2, BrainCircuit } from 'lucide-react';

interface Props {
  state: AppState;
  onComplete: (newGoal?: Goal) => void;
  awardBadge: (id: string) => void;
}

const MonthlyRecap: React.FC<Props> = ({ state, onComplete, awardBadge }) => {
  const [step, setStep] = useState(0);
  const [suggestion, setSuggestion] = useState<AIGoalSuggestion | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  useEffect(() => {
    if (step === 2) {
      setLoadingSuggestion(true);
      suggestRevisedGoal(state).then(res => {
        setSuggestion(res);
        setLoadingSuggestion(false);
      });
    }
  }, [step]);

  const metrics = [
    { label: 'Total Income', value: `$${state.allocations.income.toLocaleString()}`, status: 'good' },
    { label: 'Bills Met', value: '100%', status: 'good' },
    { label: 'Savings Growth', value: `+$${state.allocations.savings}`, status: 'good' },
    { label: 'Goal Status', value: state.goal.current >= state.goal.target ? 'CRUSHED' : 'IN PROGRESS', status: state.goal.current >= state.goal.target ? 'good' : 'bad' },
  ];

  const handleFinish = (newGoal?: Goal) => {
    // Check for Goal Crusher
    if (state.goal.current >= state.goal.target) {
      awardBadge('goal-crusher');
    }
    onComplete(newGoal);
  };

  return (
    <div className="p-8 dark:bg-slate-900 transition-colors">
      {step === 0 && (
        <div className="text-center space-y-6 py-12">
          <div className="inline-block p-6 bg-emerald-100 dark:bg-emerald-900/40 rounded-full text-emerald-600 dark:text-emerald-400">
            <Trophy size={48} />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Time for a Monthly Recap</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-2">You've completed 30 days of mindful budgeting.</p>
          </div>
          <button 
            onClick={() => setStep(1)}
            className="px-8 py-4 bg-emerald-600 text-white rounded-full font-bold shadow-xl shadow-emerald-100 active:scale-95 transition"
          >
            See Recap
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold dark:text-white">Month in Review</h2>
          <div className="space-y-4">
            {metrics.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm">
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">{m.label}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{m.value}</p>
                </div>
                {m.status === 'good' ? (
                  <div className="flex flex-col items-center text-emerald-500">
                    <CheckCircle />
                    <ThumbsUp size={14} className="mt-1" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-amber-500">
                    <XCircle />
                    <ThumbsDown size={14} className="mt-1" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl space-y-4">
            <h3 className="font-bold flex items-center gap-2 dark:text-indigo-300">
              <Sparkles size={18} className="text-indigo-500" />
              Monthly Reflection
            </h3>
            <p className="text-sm text-indigo-900 dark:text-indigo-200">What was your biggest spending challenge this month?</p>
            <textarea 
              className="w-full p-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white" 
              placeholder="e.g. Dining out on weekends..."
              rows={3}
            />
          </div>

          <button 
            onClick={() => setStep(2)}
            className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-bold active:scale-95 transition"
          >
            Review Goal Strategy
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div className="text-center">
            <h2 className="text-2xl font-bold dark:text-white">Goal Strategy</h2>
            
            {loadingSuggestion ? (
              <div className="mt-6 p-12 bg-slate-50 dark:bg-slate-800 rounded-3xl flex flex-col items-center space-y-4 border border-slate-100 dark:border-slate-700">
                <BrainCircuit className="animate-bounce text-indigo-500" size={32} />
                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">AI is revising your goal based on performance...</p>
              </div>
            ) : suggestion && (
              <div className="mt-6 p-6 bg-indigo-900 dark:bg-indigo-950 text-white rounded-3xl text-left relative overflow-hidden shadow-2xl">
                <div className="relative z-10 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">AI Recommendation</h3>
                    <p className="text-2xl font-extrabold">{suggestion.suggestedName}</p>
                    <p className="text-3xl font-black mt-2">${suggestion.suggestedAmount}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-sm leading-relaxed text-indigo-100 italic">"{suggestion.reasoning}"</p>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Sparkles size={120} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
             <p className="text-center font-bold text-gray-700 dark:text-slate-300">How would you like to proceed?</p>
             <button 
               onClick={() => handleFinish()}
               className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition"
             >
               Keep Current Goal
             </button>
             {suggestion && (
               <button 
                 onClick={() => handleFinish({ name: suggestion.suggestedName, target: suggestion.suggestedAmount, current: 0 })}
                 className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition"
               >
                 Adopt AI Suggestion <Sparkles size={18} />
               </button>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyRecap;
