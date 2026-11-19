import React from 'react';
import { usePostureQuest } from '../context/PostureQuestContext';
import {
  Sliders,
  UserCheck,
  UserX,
  Gauge,
  Scale,
  Zap,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Clock,
  Coffee,
  HeartPulse,
  Radio,
} from 'lucide-react';

export const SimulatorControlBar: React.FC = () => {
  const {
    isOccupied,
    setIsOccupied,
    distanceCm,
    setDistanceCm,
    balanceLeftPct,
    setBalanceLeftPct,
    balanceRightPct,
    timeMultiplier,
    setTimeMultiplier,
    jitterEnabled,
    setJitterEnabled,
    simulatorDrawerOpen,
    applyPresetGoodPosture,
    applyPresetSlouching,
    fastForward45mSitting,
    simulate3mBreak,
    reviveFromBurnout,
    resetSimulation,
    stats,
  } = usePostureQuest();

  if (!simulatorDrawerOpen) {
    return null;
  }

  // Distance status color
  const getDistanceColor = (dist: number) => {
    if (dist >= 50) return 'text-emerald-400';
    if (dist >= 45) return 'text-amber-400';
    return 'text-rose-400 font-bold';
  };

  // Balance status color
  const getBalanceColor = (left: number) => {
    if (left >= 45 && left <= 55) return 'text-emerald-400';
    if (left >= 40 && left <= 60) return 'text-amber-400';
    return 'text-rose-400 font-bold';
  };

  return (
    <section className="bg-slate-900/95 border-b border-slate-800 px-4 lg:px-8 py-4 shadow-xl transition-all">
      <div className="max-w-7xl mx-auto">
        {/* Title bar of simulator */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Interactive Sensor Hardware Simulator
              </h2>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Mock MQTT ESP32 / ToF / Load Cells
            </span>
          </div>

          {/* Speed Multiplier & Jitter controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> Sim Speed:
            </span>
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              {([1, 10, 60] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => setTimeMultiplier(speed)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    timeMultiplier === speed
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer pl-2 border-l border-slate-800">
              <input
                type="checkbox"
                checked={jitterEnabled}
                onChange={(e) => setJitterEnabled(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-emerald-500/20"
              />
              <span className="hover:text-slate-200">Sensor Jitter</span>
            </label>
          </div>
        </div>

        {/* Main Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-center">
          {/* 1. Chair Occupancy Toggle */}
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-indigo-400" /> Chair Pressure
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isOccupied
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-700 text-slate-400 border border-slate-600'
                }`}
              >
                {isOccupied ? 'Occupied (Sitting)' : 'Empty (Standing)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => setIsOccupied(true)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  isOccupied
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Sit Down</span>
              </button>
              <button
                onClick={() => setIsOccupied(false)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  !isOccupied
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Stand Up</span>
              </button>
            </div>
          </div>

          {/* 2. Screen Distance Slider (ToF Laser) */}
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" /> ToF Distance
              </span>
              <span className={`text-xs font-mono font-bold ${getDistanceColor(distanceCm)}`}>
                {distanceCm} cm{' '}
                <span className="text-[10px] text-slate-500 font-normal">
                  ({distanceCm >= 50 ? 'Good' : distanceCm >= 45 ? 'Close' : 'Slouch'})
                </span>
              </span>
            </div>

            <div className="space-y-1.5">
              <input
                type="range"
                min={30}
                max={80}
                step={1}
                value={distanceCm}
                onChange={(e) => setDistanceCm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span className="text-rose-400 font-semibold">30cm (Slouch)</span>
                <span className="text-amber-400">45cm</span>
                <span className="text-emerald-400 font-semibold">≥50cm (Good)</span>
                <span>80cm</span>
              </div>
            </div>
          </div>

          {/* 3. Left / Right Weight Balance Slider (Load Cells) */}
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" /> Weight Balance
              </span>
              <span className={`text-xs font-mono font-bold ${getBalanceColor(balanceLeftPct)}`}>
                L: {balanceLeftPct}% | R: {balanceRightPct}%
              </span>
            </div>

            <div className="space-y-1.5">
              <input
                type="range"
                min={20}
                max={80}
                step={1}
                value={balanceLeftPct}
                onChange={(e) => setBalanceLeftPct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span className="text-rose-400">L: 20%</span>
                <span className="text-emerald-400 font-bold">45%-55% (Balanced)</span>
                <span className="text-rose-400">R: 80%</span>
              </div>
            </div>
          </div>

          {/* 4. Quick Presets Drawer */}
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex flex-col justify-between h-full">
            <span className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Fast Scenario Presets
            </span>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={applyPresetGoodPosture}
                className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors"
                title="Sit at 62cm distance with 50/50 balance"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Good Posture</span>
              </button>

              <button
                onClick={applyPresetSlouching}
                className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1.5 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors"
                title="Sit at 38cm distance with 32% weight imbalance"
              >
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>Slouching</span>
              </button>

              <button
                onClick={fastForward45mSitting}
                className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1.5 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors"
                title="Jump continuous sitting to 45 mins to test Sedentary Overtime Debuff"
              >
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Jump 45m Sitting</span>
              </button>

              <button
                onClick={simulate3mBreak}
                className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1.5 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-colors"
                title="Stand up and fulfill 3-minute break bonus condition"
              >
                <Coffee className="w-3 h-3 text-cyan-400" />
                <span>Take 3m Break</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom micro-bar: Burnout revive and reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 text-xs border-t border-slate-800/60">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-300">Rule Logic Preview:</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="text-[11px]">Good: ≥50cm & 45-55% (+10 XP/min)</span>
            <span className="text-slate-500">•</span>
            <span className="text-[11px]">Slouch: 10s grace, then -5 HP/30s</span>
            <span className="text-slate-500">•</span>
            <span className="text-[11px]">Overtime: ≥45m sitting (-50% XP, -2 HP/min)</span>
          </div>

          <div className="flex items-center gap-2">
            {stats.burnoutActive && (
              <button
                onClick={reviveFromBurnout}
                className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white animate-pulse"
              >
                <HeartPulse className="w-3 h-3" />
                <span>Admin Revive (50 HP)</span>
              </button>
            )}

            <button
              onClick={resetSimulation}
              className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/80 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

