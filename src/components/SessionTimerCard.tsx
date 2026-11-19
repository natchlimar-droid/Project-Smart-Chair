import React from 'react';
import { usePostureQuest } from '../context/PostureQuestContext';
import { Clock, Coffee, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const SessionTimerCard: React.FC = () => {
  const { stats, isOccupied } = usePostureQuest();

  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sittingLimitSeconds = 2700; // 45 minutes
  const sittingSec = stats.continuousSittingSeconds;
  const sittingPct = Math.min(100, Math.round((sittingSec / sittingLimitSeconds) * 100));

  // Break countdown / tracking: 180 seconds (3 mins)
  const breakTargetSeconds = 180;
  const breakSec = stats.breakDurationSeconds;
  const breakPct = Math.min(100, Math.round((breakSec / breakTargetSeconds) * 100));

  // SVG Ring calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const sittingStrokeDashoffset = circumference - (sittingPct / 100) * circumference;
  const breakStrokeDashoffset = circumference - (breakPct / 100) * circumference;

  const isOvertime = stats.overtimeDebuffActive || sittingSec >= sittingLimitSeconds;

  // Ring color
  const getRingColor = () => {
    if (isOvertime) return '#f43f5e'; // Rose
    if (sittingSec >= 1800) return '#f59e0b'; // Amber (>= 30 mins, break bonus ready when away!)
    return '#10b981'; // Emerald
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 backdrop-blur-md relative overflow-hidden shadow-lg flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              Session & Sedentary Timer
            </h3>
            <p className="text-[11px] text-slate-400">
              45-Minute Ergonomic Threshold Ring
            </p>
          </div>
        </div>

        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
            isOvertime
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
              : sittingSec >= 1800
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
          }`}
        >
          {isOvertime ? 'Sedentary Overtime!' : sittingSec >= 1800 ? 'Break Advised' : 'Optimal'}
        </span>
      </div>

      {/* Main Timer Dial */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
        {/* SVG Circular Ring */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 select-none">
            {/* Background track */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="#1e293b"
              strokeWidth="9"
              fill="transparent"
            />
            {/* Active progress ring */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke={isOccupied ? getRingColor() : '#06b6d4'}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={isOccupied ? sittingStrokeDashoffset : breakStrokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Central Timer Readout */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            {isOccupied ? (
              <>
                <span className="text-2xl font-black font-mono tracking-tight text-slate-100">
                  {formatTime(sittingSec)}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  / 45:00 limit
                </span>
                <span className="text-[9px] font-mono text-cyan-400 mt-0.5">
                  {sittingPct}% Sat
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-black font-mono tracking-tight text-cyan-400 animate-pulse">
                  {formatTime(breakSec)}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Active Break
                </span>
                <span className="text-[9px] font-mono text-emerald-400 mt-0.5">
                  Target: 03:00
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status & Ergonomics Guidance */}
        <div className="flex-1 space-y-2.5 text-xs">
          {isOvertime ? (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Sedentary Overtime Debuff Active</span>
              </div>
              <p className="text-[11px] text-rose-200/90 leading-relaxed">
                You have sat past the 45-minute maximum. Future EXP is cut by 50% and health drains at -2 HP/min until you stand up.
              </p>
            </div>
          ) : sittingSec >= 1800 ? (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
                <span>3-Min Break Bonus Unlocked!</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                You have sat for 30+ minutes. Stand up now for ≥3 minutes to claim <strong>+100 EXP</strong> and <strong>+20 HP</strong>!
              </p>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Session in Safe Window</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Keep spinal alignment to earn +10 EXP per minute. Standing before 45 minutes prevents metabolic fatigue.
              </p>
            </div>
          )}

          {/* Accidental Drop Protection Notice */}
          <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>🛡️ IoT Sensor Drop Buffer: &lt;5s away protected</span>
            <span>Limit: 45m</span>
          </div>
        </div>
      </div>
    </div>
  );
};

