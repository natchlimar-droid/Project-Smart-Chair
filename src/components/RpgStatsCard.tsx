import React from 'react';
import { usePostureQuest } from '../context/PostureQuestContext';
import {
  Heart,
  Sparkles,
  Flame,
  Shield,
  Zap,
  TrendingUp,
  Award,
  HelpCircle,
} from 'lucide-react';

export const RpgStatsCard: React.FC = () => {
  const { stats, activeEffects } = usePostureQuest();

  // RPG Title progression based on level
  const getLevelTitle = (lvl: number) => {
    if (lvl >= 10) return 'Arch-Ergonomic Ascendant';
    if (lvl >= 8) return 'Grand Spine Marshal';
    if (lvl >= 6) return 'Lumbar Vanguard';
    if (lvl >= 4) return 'Posture Paladin';
    if (lvl >= 2) return 'Ergonomic Squire';
    return 'Novice Sitter';
  };

  // Health color calculation
  const getHpColor = (hp: number) => {
    if (hp > 60) return { bar: 'from-emerald-500 to-teal-400', text: 'text-emerald-400', ring: 'ring-emerald-500/20' };
    if (hp > 25) return { bar: 'from-amber-500 to-yellow-400', text: 'text-amber-400', ring: 'ring-amber-500/20' };
    return { bar: 'from-rose-600 to-red-500 animate-pulse', text: 'text-rose-400 font-extrabold', ring: 'ring-rose-500/30' };
  };

  const hpStyle = getHpColor(stats.hp);
  const expPct = Math.min(100, Math.round((stats.exp / stats.expToNextLevel) * 100));

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 backdrop-blur-md relative overflow-hidden shadow-lg">
      {/* Top Section: Avatar & Level Info */}
      <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {/* Character Portrait Badge */}
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/40">
              🛡️
            </div>
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-slate-950 border border-slate-700 text-[10px] font-extrabold text-emerald-400">
              Lv.{stats.level}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-100">
                Alex Rivera
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {getLevelTitle(stats.level)}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <span>Class: Ergonomic Guardian</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-mono text-[11px]">Rank #1</span>
            </p>
          </div>
        </div>

        {/* Daily Streak Counter with Freeze Shield */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs shadow-sm">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-bounce" />
            <span>{stats.dailyStreak}-Day Streak</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span>Streak Shield Active</span>
          </span>
        </div>
      </div>

      {/* Health Bar (HP 0-100) */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Heart className={`w-3.5 h-3.5 ${hpStyle.text} fill-current`} /> Health (HP)
          </span>
          <span className={`font-mono font-bold ${hpStyle.text}`}>
            {Math.round(stats.hp)} / {stats.maxHp} HP
          </span>
        </div>
        <div className="w-full h-3 bg-slate-950 rounded-full p-0.5 border border-slate-800 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${hpStyle.bar} transition-all duration-300 shadow-md`}
            style={{ width: `${Math.max(0, Math.min(100, stats.hp))}%` }}
          />
        </div>
        {stats.hp <= 25 && (
          <p className="text-[11px] text-rose-400 mt-1 font-medium flex items-center gap-1">
            <span>Critical HP Warning! Stand up or fix posture to avoid Burnout!</span>
          </p>
        )}
      </div>

      {/* Experience Points Bar (EXP) */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Experience (EXP)
          </span>
          <span className="font-mono text-xs text-slate-300">
            <span className="text-cyan-400 font-bold">{Math.round(stats.exp)}</span> / {stats.expToNextLevel} EXP{' '}
            <span className="text-slate-500 font-normal">({expPct}%)</span>
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full p-0.5 border border-slate-800 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-300 shadow-md"
            style={{ width: `${expPct}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1 text-[10px] text-slate-500">
          <span>+10 EXP / min (Good Posture)</span>
          <span>Next: Lv.{stats.level + 1}</span>
        </div>
      </div>

      {/* Active Buffs & Debuffs Status Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Active Status Effects
          </span>
          <span className="text-[10px] text-slate-500">
            {activeEffects.length} active
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {activeEffects.map((effect) => (
            <div
              key={effect.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border shadow-sm transition-all group relative cursor-help ${
                effect.type === 'buff'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}
            >
              <span>{effect.icon}</span>
              <span className="font-semibold">{effect.name}</span>

              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-300 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                {effect.description}
              </div>
            </div>
          ))}

          {activeEffects.length === 0 && (
            <span className="text-xs text-slate-500 italic">No active status effects</span>
          )}
        </div>
      </div>
    </div>
  );
};

