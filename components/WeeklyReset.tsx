
import React, { useState, useEffect } from 'react';
import { AppState, AIReviewResponse } from '../types';
import { getWeeklyReview } from '../geminiService';
import { Calendar, RefreshCcw, ThumbsUp, ThumbsDown, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  state: AppState;
  onComplete: () => void;
  awardBadge: (id: string) => void;
}

const WeeklyReset: React.FC<Props> = ({ state, onComplete, awardBadge }) => {
  const [step, setStep] = useState(0);
  const [sentiment, setSentiment] = useState<'great' | 'okay' | 'tough' | null>(null);
  const [review, setReview] = useState<AIReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReview = async () => {
    setLoading(true);
    const result = await getWeeklyReview(state.history, state.goal);
    setReview(result);
    setLoading(false);
  };

  useEffect(() => {
    if (step === 2) fetchReview();
  }, [step]);

  const handleFinish = () => {
    // Check for Budget Master: Stayed within budget for all categories
    const overspent = state.categories.some(c => c.spent > c.budgeted);
    if (!overspent) {
      awardBadge('budget-master');
    }
    onComplete();
  };

  return (
    <div className="p-8 dark:bg-slate-900 transition-colors">
      {step === 0 && (
        <div className="text-center space-y-6 py-12">
          <div className="inline-block p-6 bg-indigo-100 dark:bg-indigo-900/40 rounded-full text-indigo-600 dark:text-indigo-400">
            <Calendar size={48} />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Time for a Weekly Reset</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-2">Let's reflect and realign for the upcoming week.</p>
          </div>
          <button 
            onClick={() => setStep(1)}
            className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold shadow-xl shadow-indigo-100 active:scale-95 transition"
          >
            Start Reset
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold dark:text-white">Weekly Performance</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Bills Paid" value="$450" />
            <StatCard label="Savings Added" value={`$${state.allocations.savings}`} />
            <StatCard label="Spent Elsewhere" value="$120" />
            <StatCard label="Income Received" value={`$${state.allocations.income}`} />
          </div>
          
          <div className="space-y-4">
            <p className="text-center font-bold text-gray-700 dark:text-slate-300">How do you feel about this week?</p>
            <div className="flex justify-center gap-4">
              <MoodButton label="Great" selected={sentiment === 'great'} onClick={() => setSentiment('great')} />
              <MoodButton label="Okay" selected={sentiment === 'okay'} onClick={() => setSentiment('okay')} />
              <MoodButton label="Tough" selected={sentiment === 'tough'} onClick={() => setSentiment('tough')} />
            </div>
          </div>
          
          <button 
            disabled={!sentiment}
            onClick={() => setStep(2)}
            className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-bold disabled:opacity-50 active:scale-95 transition"
          >
            Analyze Performance
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
            <RefreshCcw className="text-indigo-500" />
            Deep Dive Review
          </h2>
          
          {loading ? (
            <div className="flex flex-col items-center py-12 space-y-4">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
              <p className="text-gray-500 dark:text-slate-400">AI is analyzing your patterns...</p>
            </div>
          ) : review && (
            <>
              <div className="space-y-4">
                <section>
                  <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2">Strengths</h3>
                  <ul className="space-y-2">
                    {review.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg border border-emerald-100 dark:border-emerald-800">
                        <ThumbsUp size={16} className="shrink-0 text-emerald-500" /> {s}
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3 className="text-xs font-bold text-red-600 dark:text-rose-400 uppercase mb-2">Weaknesses</h3>
                  <ul className="space-y-2">
                    {review.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-slate-300 bg-red-50 dark:bg-rose-900/20 p-2 rounded-lg border border-red-100 dark:border-rose-800">
                        <ThumbsDown size={16} className="shrink-0 text-red-500" /> {w}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="bg-indigo-900 text-white p-4 rounded-2xl shadow-lg">
                <h4 className="font-bold mb-2">Weekly Coaching Advice</h4>
                <p className="text-indigo-100 text-sm italic">"{review.advice}"</p>
              </div>

              <div className="pt-4 space-y-4">
                <p className="text-sm font-medium text-center dark:text-slate-300">Do you want to allocate more to your monthly goal next week?</p>
                <div className="flex gap-2">
                  <button onClick={handleFinish} className="flex-1 py-3 border border-gray-200 dark:border-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition">Maybe later</button>
                  <button onClick={handleFinish} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition">
                    Yes, Increase <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value }: { label: string, value: string }) => (
  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
    <p className="text-xs text-gray-500 dark:text-slate-500 font-medium mb-1 uppercase tracking-tighter">{label}</p>
    <p className="text-xl font-bold text-slate-800 dark:text-white">{value}</p>
  </div>
);

const MoodButton = ({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition ${
      selected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-100 dark:border-slate-800 text-gray-400 hover:border-indigo-100'
    }`}
  >
    {label}
  </button>
);

export default WeeklyReset;
