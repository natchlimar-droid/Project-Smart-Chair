export interface TelemetryPayload {
  timestamp: string;
  is_occupied: boolean;
  distance_cm: number;
  balance_left_pct: number;
  balance_right_pct: number;
}

export type PostureState =
  | 'IDLE_AWAY'
  | 'GOOD_POSTURE'
  | 'WARNING_POSTURE'
  | 'SLOUCHING'
  | 'BURNOUT_EXHAUSTED';

export type DebuffType = 'OVERTIME_DEBUFF' | 'SLOUCH_STRAIN' | 'BURNOUT';
export type BuffType = 'SPINE_ALIGNMENT' | 'BREAK_BONUS' | 'STREAK_SHIELD';

export interface ActiveStatusEffect {
  id: string;
  name: string;
  type: 'buff' | 'debuff';
  description: string;
  icon: string;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  type:
    | 'MQTT'
    | 'EXP_GAIN'
    | 'HP_LOSS'
    | 'HP_HEAL'
    | 'DEBUFF'
    | 'BONUS'
    | 'LEVEL_UP'
    | 'WARNING'
    | 'BURNOUT'
    | 'SYSTEM';
  message: string;
  payload?: TelemetryPayload;
}

export interface GameStats {
  level: number;
  exp: number;
  expToNextLevel: number;
  hp: number;
  maxHp: number;
  dailyStreak: number;
  continuousSittingSeconds: number;
  breakDurationSeconds: number;
  slouchWarningSeconds: number;
  slouchContinuousSeconds: number;
  totalGoodPostureSecondsToday: number;
  totalSittingSecondsToday: number;
  totalSlouchSecondsToday: number;
  slouchIncidentsCount: number;
  overtimeDebuffActive: boolean;
  burnoutActive: boolean;
  burnoutBreakSecondsProgress: number; // needs 300s (5 mins) to revive
}

export interface DailyAnalytics {
  date: string;
  dayName: string;
  sittingHours: number;
  goodPosturePct: number;
  slouchCount: number;
  breaksTaken: number;
  expEarned: number;
}

export interface HourlyFatigue {
  hour: string; // e.g. "09:00"
  sittingMins: number;
  slouchMins: number;
  goodPostureMins: number;
  slouchRatio: number; // percentage
  isPeakFatigue?: boolean;
}

export interface LeaderboardMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  goodPosturePct: number;
  breakConsistencyPct: number;
  level: number;
  title: string;
  coopDamageContribution: number;
  isCurrentUser?: boolean;
}

export interface TeamBoss {
  name: string;
  title: string;
  currentHp: number;
  maxHp: number;
  description: string;
  rewardExp: number;
  daysRemaining: number;
}

