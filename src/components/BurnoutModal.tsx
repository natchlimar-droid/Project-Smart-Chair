import React from 'react';
import { usePostureQuest } from '../context/PostureQuestContext';
import { Skull, HeartPulse, Footprints, RotateCcw, AlertTriangle } from 'lucide-react';

export const BurnoutModal: React.FC = () => {
  const { stats, isOccupied, setIsOccupied, reviveFromBurnout } = usePostureQuest();

  if (!stats.burnoutActive) return null;

  const requiredBreakSec = 300; // 5 minutes
  const progressSec = stats.burnoutBreakSecondsProgress;
  const remainingSec = Math.max(0, requiredBreakSec - progressSec);

  const formatRemaining = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const progressPct = Math.min(100, Math.round((progressSec / requiredBreakSec) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border-2 border-rose-500/60 rounded-3xl max-w-lg w-full p-6 text-center shadow-2xl shadow-rose-950/50 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Skull Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-3xl shadow-lg shadow-rose-500/20 mb-4 animate-bounce">
          💀
        </div>

        <h2 className="text-2xl font-black text-rose-400 tracking-tight mb-1">
          Burnout & Spinal Exhaustion!
        </h2>
        <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">
          Your Health dropped to 0 HP due to continuous posture strain and neglected sedentary overtime debuffs.
        </p>

        {/* Revival Quest Requirement Box */}
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-left mb-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-emerald-400" /> Mandatory Active Walk
            </span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {formatRemaining(remainingSec)} left
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full p-0.5 overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            {isOccupied ? (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                You are currently seated! Please stand up to begin walking.
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 animate-pulse" />
                Walking in progress... Sensor tracking your recovery break.
              </span>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {isOccupied && (
            <button
              onClick={() => setIsOccupied(false)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Footprints className="w-4 h-4" />
              <span>Stand Up & Walk</span>
            </button>
          )}

          <button
            onClick={reviveFromBurnout}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <HeartPulse className="w-4 h-4 text-purple-400" />
            <span>Developer Immediate Revive (50 HP)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

