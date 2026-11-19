import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import {
  TelemetryPayload,
  PostureState,
  GameStats,
  TelemetryLog,
  ActiveStatusEffect,
  DailyAnalytics,
  HourlyFatigue,
  LeaderboardMember,
  TeamBoss,
} from '../types';
import {
  INITIAL_7_DAY_TREND,
  INITIAL_HOURLY_FATIGUE,
  INITIAL_LEADERBOARD,
  INITIAL_TEAM_BOSS,
} from '../data/mockAnalyticsData';

interface PostureQuestContextType {
  // Telemetry & Control states
  isOccupied: boolean;
  distanceCm: number;
  balanceLeftPct: number;
  balanceRightPct: number;
  timeMultiplier: 1 | 10 | 60;
  jitterEnabled: boolean;
  currentTelemetry: TelemetryPayload;

  // Posture State & Game Stats
  postureState: PostureState;
  stats: GameStats;
  activeEffects: ActiveStatusEffect[];
  logs: TelemetryLog[];

  // Analytics data
  dailyAnalytics: DailyAnalytics[];
  hourlyFatigue: HourlyFatigue[];
  leaderboard: LeaderboardMember[];
  teamBoss: TeamBoss;

  // Audio / Sound state
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;

  // UI state
  activeTab: 'quest' | 'analytics';
  setActiveTab: (tab: 'quest' | 'analytics') => void;
  simulatorDrawerOpen: boolean;
  setSimulatorDrawerOpen: (open: boolean) => void;
  demoMode: boolean;
  setDemoMode: (active: boolean) => void;
  levelUpNotification: { show: boolean; level: number } | null;
  dismissLevelUp: () => void;

  // Controls setters
  setIsOccupied: (occupied: boolean) => void;
  setDistanceCm: (distance: number) => void;
  setBalanceLeftPct: (pct: number) => void;
  setTimeMultiplier: (multiplier: 1 | 10 | 60) => void;
  setJitterEnabled: (jitter: boolean) => void;

  // Presets & Quick Actions
  applyPresetGoodPosture: () => void;
  applyPresetSlouching: () => void;
  fastForward45mSitting: () => void;
  simulate3mBreak: () => void;
  reviveFromBurnout: () => void;
  resetSimulation: () => void;
  clearLogs: () => void;
}

const PostureQuestContext = createContext<PostureQuestContextType | undefined>(undefined);

export const PostureQuestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Simulator input settings
  const [isOccupied, setIsOccupiedState] = useState<boolean>(true);
  const [distanceCm, setDistanceCmState] = useState<number>(62);
  const [balanceLeftPct, setBalanceLeftPctState] = useState<number>(50);
  const [timeMultiplier, setTimeMultiplier] = useState<1 | 10 | 60>(1);
  const [jitterEnabled, setJitterEnabled] = useState<boolean>(true);

  // App UI state
  const [activeTab, setActiveTab] = useState<'quest' | 'analytics'>('quest');
  const [simulatorDrawerOpen, setSimulatorDrawerOpen] = useState<boolean>(true);
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [levelUpNotification, setLevelUpNotification] = useState<{ show: boolean; level: number } | null>(null);

  // Core Game Stats
  const [stats, setStats] = useState<GameStats>({
    level: 4,
    exp: 280,
    expToNextLevel: 400,
    hp: 95,
    maxHp: 100,
    dailyStreak: 5,
    continuousSittingSeconds: 1140, // 19 minutes initially
    breakDurationSeconds: 0,
    slouchWarningSeconds: 0,
    slouchContinuousSeconds: 0,
    totalGoodPostureSecondsToday: 13200, // ~3.6 hours
    totalSittingSecondsToday: 17100, // ~4.75 hours
    totalSlouchSecondsToday: 3900,
    slouchIncidentsCount: 8,
    overtimeDebuffActive: false,
    burnoutActive: false,
    burnoutBreakSecondsProgress: 0,
  });

  // Derived balance right
  const balanceRightPct = useMemo(() => 100 - balanceLeftPct, [balanceLeftPct]);

  // Current Live MQTT Telemetry Payload
  const [currentTelemetry, setCurrentTelemetry] = useState<TelemetryPayload>({
    timestamp: new Date().toISOString(),
    is_occupied: true,
    distance_cm: 62,
    balance_left_pct: 50,
    balance_right_pct: 50,
  });

  // Logs stream
  const [logs, setLogs] = useState<TelemetryLog[]>([
    {
      id: 'log-init-1',
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
      type: 'SYSTEM',
      message: 'PostureQuest IoT Core initialized. MQTT stream active (1Hz).',
    },
    {
      id: 'log-init-2',
      timestamp: new Date(Date.now() - 30000).toLocaleTimeString(),
      type: 'EXP_GAIN',
      message: '+10 EXP earned for maintaining optimal spinal alignment.',
    },
  ]);

  // Historical Analytics state
  const [dailyAnalytics] = useState<DailyAnalytics[]>(INITIAL_7_DAY_TREND);
  const [hourlyFatigue] = useState<HourlyFatigue[]>(INITIAL_HOURLY_FATIGUE);
  const [leaderboard, setLeaderboard] = useState<LeaderboardMember[]>(INITIAL_LEADERBOARD);
  const [teamBoss, setTeamBoss] = useState<TeamBoss>(INITIAL_TEAM_BOSS);

  // Refs for tracking state inside real-time intervals
  const isOccupiedRef = useRef(isOccupied);
  isOccupiedRef.current = isOccupied;

  const distanceCmRef = useRef(distanceCm);
  distanceCmRef.current = distanceCm;

  const balanceLeftPctRef = useRef(balanceLeftPct);
  balanceLeftPctRef.current = balanceLeftPct;

  const timeMultiplierRef = useRef(timeMultiplier);
  timeMultiplierRef.current = timeMultiplier;

  const jitterEnabledRef = useRef(jitterEnabled);
  jitterEnabledRef.current = jitterEnabled;

  const statsRef = useRef(stats);
  statsRef.current = stats;

  // Accidental sensor drop buffer (< 5 seconds away does not reset sitting session)
  const accidentalDropCounterRef = useRef<number>(0);

  // Posture State determination
  const postureState: PostureState = useMemo(() => {
    if (stats.burnoutActive) return 'BURNOUT_EXHAUSTED';
    if (!isOccupied) return 'IDLE_AWAY';
    const isGoodDistance = distanceCm >= 50;
    const isGoodBalance = balanceLeftPct >= 45 && balanceLeftPct <= 55;

    if (isGoodDistance && isGoodBalance) {
      return 'GOOD_POSTURE';
    }
    if (stats.slouchWarningSeconds > 0 && stats.slouchWarningSeconds < 10) {
      return 'WARNING_POSTURE';
    }
    return 'SLOUCHING';
  }, [isOccupied, distanceCm, balanceLeftPct, stats.slouchWarningSeconds, stats.burnoutActive]);

  // Audio beep effect synthesizer (using Web Audio API for zero dependencies)
  const playAudioCue = (type: 'good' | 'warning' | 'penalty' | 'levelup' | 'bonus' | 'revive') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'good') {
        osc.frequency.setValueAtTime(523.25, now); // C5
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'warning') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.25);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'penalty') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.35);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'levelup') {
        // Arpeggio
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.1);
        osc.frequency.setValueAtTime(659.25, now + 0.2);
        osc.frequency.setValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'bonus') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'revive') {
        osc.frequency.setValueAtTime(261.63, now);
        osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.4);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch {
      // AudioContext could be blocked until user gesture, ignore safely
    }
  };

  const addLog = (
    type: TelemetryLog['type'],
    message: string,
    payload?: TelemetryPayload
  ) => {
    const newLog: TelemetryLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      payload,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  // Active status effects (Buffs / Debuffs)
  const activeEffects = useMemo(() => {
    const list: ActiveStatusEffect[] = [];

    if (stats.burnoutActive) {
      list.push({
        id: 'burnout',
        name: 'Burnout / Exhausted',
        type: 'debuff',
        description: 'Zero health remaining! Take a 5-minute break away from chair to recover.',
        icon: '💀',
      });
    }

    if (stats.overtimeDebuffActive) {
      list.push({
        id: 'overtime-debuff',
        name: 'Sedentary Overtime',
        type: 'debuff',
        description: 'Continuous sitting >= 45m. Future EXP reduced by 50% and draining -2 HP/min until you stand up.',
        icon: '⏳',
      });
    }

    if (postureState === 'SLOUCHING') {
      list.push({
        id: 'slouch-strain',
        name: 'Slouch Strain',
        type: 'debuff',
        description: 'Forward head or severe weight tilt. Draining -5 HP every 30 seconds!',
        icon: '⚠️',
      });
    }

    if (postureState === 'GOOD_POSTURE' && !stats.burnoutActive) {
      list.push({
        id: 'spine-align',
        name: 'Spinal Alignment',
        type: 'buff',
        description: stats.overtimeDebuffActive
          ? 'Good posture (+5 EXP/min due to overtime debuff).'
          : 'Optimal ergonomics! Earning +10 EXP/min & damaging boss.',
        icon: '✨',
      });
    }

    if (stats.dailyStreak >= 3) {
      list.push({
        id: 'streak-shield',
        name: `${stats.dailyStreak}-Day Streak`,
        type: 'buff',
        description: 'Consistent ergonomic habits active! Co-op damage boosted.',
        icon: '🔥',
      });
    }

    if (!isOccupied && stats.breakDurationSeconds >= 180) {
      list.push({
        id: 'break-bonus',
        name: 'Active Break Hero',
        type: 'buff',
        description: '3+ min active break bonus awarded! HP refreshed & session reset.',
        icon: '🏃‍♂️',
      });
    }

    return list;
  }, [stats, postureState, isOccupied]);

  // Main Real-time Simulation Engine Loop (Runs at 1 second intervals)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentMultiplier = timeMultiplierRef.current;
      const currentOccupied = isOccupiedRef.current;
      let currentDistance = distanceCmRef.current;
      let currentBalanceLeft = balanceLeftPctRef.current;

      // Jitter simulation for realistic micro-vibrations
      if (jitterEnabledRef.current && currentOccupied) {
        const noiseDist = (Math.random() - 0.5) * 1.5; // +/- 0.75 cm
        const noiseBal = (Math.random() - 0.5) * 1.2; // +/- 0.6%
        currentDistance = Math.max(30, Math.min(80, Math.round((currentDistance + noiseDist) * 10) / 10));
        currentBalanceLeft = Math.max(20, Math.min(80, Math.round((currentBalanceLeft + noiseBal) * 10) / 10));
      }

      const currentBalanceRight = Math.round((100 - currentBalanceLeft) * 10) / 10;
      const payload: TelemetryPayload = {
        timestamp: new Date().toISOString(),
        is_occupied: currentOccupied,
        distance_cm: currentDistance,
        balance_left_pct: currentBalanceLeft,
        balance_right_pct: currentBalanceRight,
      };
      setCurrentTelemetry(payload);

      // Simulation time delta in seconds for this tick
      const deltaSeconds = 1 * currentMultiplier;

      // Execute State Machine & Rule Evaluations
      setStats((prevStats) => {
        let {
          level,
          exp,
          expToNextLevel,
          hp,
          continuousSittingSeconds,
          breakDurationSeconds,
          slouchWarningSeconds,
          slouchContinuousSeconds,
          totalGoodPostureSecondsToday,
          totalSittingSecondsToday,
          totalSlouchSecondsToday,
          slouchIncidentsCount,
          overtimeDebuffActive,
          burnoutActive,
          burnoutBreakSecondsProgress,
        } = prevStats;

        // ==========================================
        // SCENARIO 1: CHAIR IS UNOCCUPIED (STAND / BREAK)
        // ==========================================
        if (!currentOccupied) {
          // Track accidental drop (< 5s away won't reset the sitting timer)
          accidentalDropCounterRef.current += deltaSeconds;

          // Increment break duration
          breakDurationSeconds += deltaSeconds;

          // If Burnout is active, track the required 5-minute break (300 seconds)
          if (burnoutActive) {
            burnoutBreakSecondsProgress += deltaSeconds;
            if (burnoutBreakSecondsProgress >= 300) {
              burnoutActive = false;
              burnoutBreakSecondsProgress = 0;
              hp = 50; // Revived to 50 HP
              addLog('SYSTEM', '🌟 Revived from Burnout! You completed a 5-minute walking break. HP set to 50.');
              playAudioCue('revive');
            }
          }

          // Active Break Bonus: if user was sitting >= 30 mins (1800s) and stays away >= 3 mins (180s)
          if (continuousSittingSeconds >= 1800 && breakDurationSeconds >= 180) {
            exp += 100;
            hp = Math.min(100, hp + 20);
            continuousSittingSeconds = 0;
            overtimeDebuffActive = false;
            slouchWarningSeconds = 0;
            slouchContinuousSeconds = 0;
            addLog('BONUS', '🏆 Active Break Bonus Claimed! +100 EXP & +20 HP. Sitting timer & debuffs cleared.');
            playAudioCue('bonus');

            // Apply boss damage
            setTeamBoss((boss) => ({
              ...boss,
              currentHp: Math.max(0, boss.currentHp - 250),
            }));

            // Reset break duration to avoid re-triggering repeatedly in the same break
            breakDurationSeconds = 0;
          }

          // Reset slouch warning & continuous slouch while away
          slouchWarningSeconds = 0;
          slouchContinuousSeconds = 0;

          return {
            ...prevStats,
            hp,
            exp,
            continuousSittingSeconds,
            breakDurationSeconds,
            slouchWarningSeconds,
            slouchContinuousSeconds,
            overtimeDebuffActive,
            burnoutActive,
            burnoutBreakSecondsProgress,
          };
        }

        // ==========================================
        // SCENARIO 2: CHAIR IS OCCUPIED (SITTING)
        // ==========================================
        // Check accidental sensor drop buffer:
        // If user stood up for less than 5 seconds and sat back down, sitting timer continues!
        accidentalDropCounterRef.current = 0;

        // If user sat down again after completing an ordinary break, reset break tracking
        breakDurationSeconds = 0;

        continuousSittingSeconds += deltaSeconds;
        totalSittingSecondsToday += deltaSeconds;

        // Evaluate posture criteria
        const isGoodDistance = currentDistance >= 50;
        const isGoodBalance = currentBalanceLeft >= 45 && currentBalanceLeft <= 55;
        const isGood = isGoodDistance && isGoodBalance;

        // --- SEDENTARY OVERTIME CHECK (>= 45 mins / 2700s) ---
        if (continuousSittingSeconds >= 2700) {
          if (!overtimeDebuffActive) {
            overtimeDebuffActive = true;
            addLog(
              'DEBUFF',
              '⏳ Sedentary Overtime triggered (Sitting >= 45m)! Future EXP reduced by 50% & draining -2 HP/min until you stand up.'
            );
            playAudioCue('warning');
          }

          // Overtime HP drain: -2 HP per 60 seconds
          const overtimeDrain = (2 / 60) * deltaSeconds;
          if (!burnoutActive) {
            hp = Math.max(0, hp - overtimeDrain);
            if (hp <= 0) {
              burnoutActive = true;
              hp = 0;
              addLog('BURNOUT', '💀 Burnout! Health depleted to 0 due to prolonged sitting. 5-min walk required!');
              playAudioCue('penalty');
            }
          }
        }

        // --- GOOD POSTURE HANDLING ---
        if (isGood) {
          slouchWarningSeconds = 0;
          slouchContinuousSeconds = 0;
          totalGoodPostureSecondsToday += deltaSeconds;

          // EXP Rule: +10 EXP per minute (= 10/60 per sec). If overtime debuff: 50% (= 5/60 per sec).
          if (!burnoutActive) {
            const expPerSec = overtimeDebuffActive ? 5 / 60 : 10 / 60;
            const expGained = expPerSec * deltaSeconds;
            exp += expGained;

            // Damage boss proportionally
            setTeamBoss((boss) => ({
              ...boss,
              currentHp: Math.max(0, boss.currentHp - expGained * 0.5),
            }));

            // Level Up Check
            if (exp >= expToNextLevel) {
              exp -= expToNextLevel;
              level += 1;
              expToNextLevel = level * 100;
              hp = Math.min(100, hp + 25);
              setLevelUpNotification({ show: true, level });
              addLog('LEVEL_UP', `🎉 LEVEL UP! You reached Level ${level}! +25 HP restored.`);
              playAudioCue('levelup');
            }
          }
        }
        // --- POOR POSTURE / SLOUCHING HANDLING ---
        else {
          // Grace period of 10 seconds in simulator time
          slouchWarningSeconds += deltaSeconds;

          if (slouchWarningSeconds >= 10) {
            // First tick crossing into Slouching state
            if (slouchContinuousSeconds === 0) {
              slouchIncidentsCount += 1;
              addLog(
                'WARNING',
                `⚠️ Posture Warning: Slouching detected (Dist: ${currentDistance}cm, Balance: ${currentBalanceLeft}%). EXP paused, HP drain incoming!`
              );
              playAudioCue('warning');
            }

            const previousSlouchSec = slouchContinuousSeconds;
            slouchContinuousSeconds += deltaSeconds;
            totalSlouchSecondsToday += deltaSeconds;

            // HP Rule: Deduct -5 HP every 30 seconds of continuous slouching
            const previousIntervals = Math.floor(previousSlouchSec / 30);
            const currentIntervals = Math.floor(slouchContinuousSeconds / 30);

            if (currentIntervals > previousIntervals && !burnoutActive) {
              const penalty = 5 * (currentIntervals - previousIntervals);
              hp = Math.max(0, hp - penalty);
              addLog('HP_LOSS', `💔 Slouch Strain: -${penalty} HP deducted for sustained poor posture (HP: ${Math.round(hp)}).`);
              playAudioCue('penalty');

              if (hp <= 0) {
                burnoutActive = true;
                hp = 0;
                addLog('BURNOUT', '💀 Burnout! Health depleted to 0. You must take a 5-minute break to revive!');
                playAudioCue('penalty');
              }
            }
          }
        }

        return {
          ...prevStats,
          level,
          exp: Math.round(exp * 10) / 10,
          expToNextLevel,
          hp: Math.round(hp * 10) / 10,
          continuousSittingSeconds,
          breakDurationSeconds,
          slouchWarningSeconds,
          slouchContinuousSeconds,
          totalGoodPostureSecondsToday,
          totalSittingSecondsToday,
          totalSlouchSecondsToday,
          slouchIncidentsCount,
          overtimeDebuffActive,
          burnoutActive,
          burnoutBreakSecondsProgress,
        };
      });

      // Update current user rank damage in leaderboard
      setLeaderboard((prev) =>
        prev.map((member) =>
          member.isCurrentUser
            ? {
                ...member,
                level: statsRef.current.level,
                goodPosturePct:
                  statsRef.current.totalSittingSecondsToday > 0
                    ? Math.round(
                        (statsRef.current.totalGoodPostureSecondsToday /
                          statsRef.current.totalSittingSecondsToday) *
                          100
                      )
                    : 81,
                coopDamageContribution: Math.round(statsRef.current.exp * 4),
              }
            : member
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Quick Presets
  const applyPresetGoodPosture = () => {
    setIsOccupiedState(true);
    setDistanceCmState(62);
    setBalanceLeftPctState(50);
    setStats((s) => ({ ...s, slouchWarningSeconds: 0, slouchContinuousSeconds: 0 }));
    addLog('SYSTEM', 'Preset applied: Optimal Ergonomic Posture (62cm, 50/50 balance).');
  };

  const applyPresetSlouching = () => {
    setIsOccupiedState(true);
    setDistanceCmState(38); // < 45 triggers forward head
    setBalanceLeftPctState(32); // severe weight tilt
    addLog('SYSTEM', 'Preset applied: Forward Head Slouch (38cm, 32/68 balance).');
  };

  const fastForward45mSitting = () => {
    setIsOccupiedState(true);
    setStats((prev) => ({
      ...prev,
      continuousSittingSeconds: 2700, // 45 minutes
      overtimeDebuffActive: true,
    }));
    addLog('SYSTEM', '⚡ Fast-forward: Continuous sitting accelerated to 45m (Overtime debuff triggered).');
    playAudioCue('warning');
  };

  const simulate3mBreak = () => {
    setIsOccupiedState(false);
    // If sitting was >= 30m (or ensure it qualifies)
    setStats((prev) => {
      const sittingBefore = Math.max(prev.continuousSittingSeconds, 1800);
      return {
        ...prev,
        continuousSittingSeconds: sittingBefore,
        breakDurationSeconds: 180, // satisfy 3m break requirement
      };
    });
    addLog('SYSTEM', '⚡ Fast-forward: 3-Minute Active Break taken.');
  };

  const reviveFromBurnout = () => {
    setStats((prev) => ({
      ...prev,
      hp: 50,
      burnoutActive: false,
      burnoutBreakSecondsProgress: 0,
      continuousSittingSeconds: 0,
      overtimeDebuffActive: false,
      slouchWarningSeconds: 0,
      slouchContinuousSeconds: 0,
    }));
    setIsOccupiedState(false);
    addLog('SYSTEM', '✨ Admin Revive: Character rejuvenated to 50 HP.');
    playAudioCue('revive');
  };

  const resetSimulation = () => {
    setIsOccupiedState(true);
    setDistanceCmState(62);
    setBalanceLeftPctState(50);
    setTimeMultiplier(1);
    setStats({
      level: 1,
      exp: 0,
      expToNextLevel: 100,
      hp: 100,
      maxHp: 100,
      dailyStreak: 1,
      continuousSittingSeconds: 0,
      breakDurationSeconds: 0,
      slouchWarningSeconds: 0,
      slouchContinuousSeconds: 0,
      totalGoodPostureSecondsToday: 0,
      totalSittingSecondsToday: 0,
      totalSlouchSecondsToday: 0,
      slouchIncidentsCount: 0,
      overtimeDebuffActive: false,
      burnoutActive: false,
      burnoutBreakSecondsProgress: 0,
    });
    addLog('SYSTEM', 'Simulation reset to pristine initial state (Level 1, 100 HP).');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const dismissLevelUp = () => {
    setLevelUpNotification(null);
  };

  return (
    <PostureQuestContext.Provider
      value={{
        isOccupied,
        distanceCm,
        balanceLeftPct,
        balanceRightPct,
        timeMultiplier,
        jitterEnabled,
        currentTelemetry,
        postureState,
        stats,
        activeEffects,
        logs,
        dailyAnalytics,
        hourlyFatigue,
        leaderboard,
        teamBoss,
        soundEnabled,
        setSoundEnabled,
        activeTab,
        setActiveTab,
        simulatorDrawerOpen,
        setSimulatorDrawerOpen,
        demoMode,
        setDemoMode,
        levelUpNotification,
        dismissLevelUp,
        setIsOccupied: setIsOccupiedState,
        setDistanceCm: setDistanceCmState,
        setBalanceLeftPct: setBalanceLeftPctState,
        setTimeMultiplier,
        setJitterEnabled,
        applyPresetGoodPosture,
        applyPresetSlouching,
        fastForward45mSitting,
        simulate3mBreak,
        reviveFromBurnout,
        resetSimulation,
        clearLogs,
      }}
    >
      {children}
    </PostureQuestContext.Provider>
  );
};

export const usePostureQuest = () => {
  const context = useContext(PostureQuestContext);
  if (!context) {
    throw new Error('usePostureQuest must be used within a PostureQuestProvider');
  }
  return context;
};

