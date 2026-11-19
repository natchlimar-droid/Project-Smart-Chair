import React, { useState, useEffect } from 'react';
import { usePostureQuest } from '../context/PostureQuestContext';
import {
  Shield,
  Activity,
  Sliders,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Zap,
  Award,
  BarChart3,
  Flame,
  PlayCircle,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    postureState,
    stats,
    timeMultiplier,
    soundEnabled,
    setSoundEnabled,
    activeTab,
    setActiveTab,
    simulatorDrawerOpen,
    setSimulatorDrawerOpen,
    demoMode,
    setDemoMode,
  } = usePostureQuest();

  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Status Badge configurations
  const getStatusBadge = () => {
    switch (postureState) {
      case 'GOOD_POSTURE':
        return {
          text: 'Optimal Alignment',
          subtext: stats.overtimeDebuffActive ? '+5 EXP/min (Overtime)' : '+10 EXP/min',
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
          dot: 'bg-emerald-400 animate-pulse',
        };
      case 'WARNING_POSTURE':
        return {
          text: 'Grace Period Warning',
          subtext: `${Math.max(0, 10 - stats.slouchWarningSeconds)}s remaining`,
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
          dot: 'bg-amber-400 animate-ping',
        };
      case 'SLOUCHING':
        return {
          text: 'Slouching Detected',
          subtext: '-5 HP / 30s penalty',
          bg: 'bg-rose-500/20 border-rose-500/50 text-rose-400',
          dot: 'bg-rose-500 animate-pulse',
        };
      case 'BURNOUT_EXHAUSTED':
        return {
          text: 'Burnout / Exhausted',
          subtext: '5m Walk Required',
          bg: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
          dot: 'bg-purple-400 animate-bounce',
        };
      case 'IDLE_AWAY':
      default:
        return {
          text: 'Chair Unoccupied',
          subtext: stats.breakDurationSeconds >= 180 ? 'Break Bonus Ready!' : 'Standing / Away',
          bg: 'bg-slate-700/30 border-slate-600/40 text-slate-400',
          dot: 'bg-slate-400',
        };
    }
  };

  const status = getStatusBadge();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/40">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  PostureQuest
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  IoT v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Office Syndrome Gamification & Smart Chair Engine
              </p>
            </div>
          </div>

          {/* Quick Streak & Speed Pills for mobile */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
              <Flame className="w-3.5 h-3.5" />
              <span>{stats.dailyStreak}d</span>
            </div>
            <button
              onClick={() => setSimulatorDrawerOpen(!simulatorDrawerOpen)}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300"
              title="Toggle Simulator"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Center: Live Posture Status Pill */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all ${status.bg}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold">{status.text}</span>
              <span className="text-[11px] opacity-80">({status.subtext})</span>
            </div>
          </div>

          {/* Time multiplier badge */}
          {timeMultiplier > 1 && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
              <Zap className="w-3 h-3" />
              {timeMultiplier}x Turbo
            </span>
          )}
        </div>

        {/* Right Navigation & Tools */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Tab Switcher */}
          <div className="flex items-center p-1 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('quest')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'quest'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Quest View</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </div>

          {/* Auto Demo Button */}
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-all ${
              demoMode
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 animate-pulse'
                : 'bg-gradient-to-r from-cyan-600/90 to-emerald-600/90 hover:from-cyan-500 hover:to-emerald-500 border-emerald-400/50 text-white shadow-md shadow-emerald-600/20'
            }`}
            title="Start Guided Interactive Demo"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>{demoMode ? 'Demo Running' : 'Auto Demo'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-slate-300 transition-colors"
            title={soundEnabled ? 'Mute Game Cues' : 'Unmute Game Cues'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-slate-300 transition-colors"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Simulator Toggle Button (Desktop) */}
          <button
            onClick={() => setSimulatorDrawerOpen(!simulatorDrawerOpen)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
              simulatorDrawerOpen
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulator Panel</span>
          </button>
        </div>
      </div>
    </header>
  );
};

