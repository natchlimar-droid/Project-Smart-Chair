import React from 'react';
import { usePostureQuest } from '../context/PostureQuestContext';
import { Sparkles, Trophy, Check, ArrowRight } from 'lucide-react';

export const LevelUpModal: React.FC = () => {
  const { levelUpNotification, dismissLevelUp } = usePostureQuest();

  if (!levelUpNotification || !levelUpNotification.show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl shadow-emerald-950/60 relative overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/25 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-3xl shadow-lg shadow-amber-400/30 mb-4 animate-bounce">
          🏆
        </div>

        <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-1">
          Ergonomic Mastery Achieved
        </div>
        <h2 className="text-3xl font-black text-slate-100 tracking-tight mb-2">
          LEVEL {levelUpNotification.level}!
        </h2>
        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          Your spinal discipline has granted you enhanced resilience against office syndrome.
        </p>

        <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-xs text-left mb-5 space-y-1.5 font-medium">
          <div className="flex items-center gap-2 text-emerald-400">
            <Check className="w-3.5 h-3.5" />
            <span>Health restored by +25 HP</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Check className="w-3.5 h-3.5" />
            <span>Boss damage multiplier boosted</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400">
            <Check className="w-3.5 h-3.5" />
            <span>Unlocked new guild prestige badge</span>
          </div>
        </div>

        <button
          onClick={dismissLevelUp}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
        >
          <span>Claim Rewards & Continue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

