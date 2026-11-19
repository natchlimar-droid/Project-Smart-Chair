import React from 'react';
import { usePostureQuest } from '../context/PostureQuestContext';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  Activity,
  Clock,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Award,
  Swords,
  Flame,
  Info,
  Calendar,
  Users,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { stats, dailyAnalytics, hourlyFatigue, leaderboard, teamBoss } = usePostureQuest();

  // Dynamic calculations for today
  const totalSittingHoursToday = Math.round((stats.totalSittingSecondsToday / 3600) * 10) / 10;
  const goodPostureRatioToday =
    stats.totalSittingSecondsToday > 0
      ? Math.round((stats.totalGoodPostureSecondsToday / stats.totalSittingSecondsToday) * 100)
      : 81;

  // Ergonomic Risk Score evaluation
  const getRiskScore = (goodRatio: number, sittingHrs: number) => {
    if (goodRatio >= 75 && sittingHrs < 7) {
      return {
        level: 'Low Risk',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        desc: 'Spinal alignment and break habits meet clinical ergonomics recommendations.',
      };
    }
    if (goodRatio >= 60 || sittingHrs < 8) {
      return {
        level: 'Moderate Risk',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        desc: 'Occasional forward head slouching during deep focus sessions.',
      };
    }
    return {
      level: 'High Risk',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
      desc: 'Frequent slouch strain and sedentary overtime exceeding safe thresholds.',
    };
  };

  const risk = getRiskScore(goodPostureRatioToday, totalSittingHoursToday);

  // Prepare 7-day trend data with today dynamically updated
  const trendData = dailyAnalytics.map((day) =>
    day.dayName === 'Today'
      ? {
          ...day,
          sittingHours: totalSittingHoursToday > 0 ? totalSittingHoursToday : day.sittingHours,
          goodPosturePct: goodPostureRatioToday > 0 ? goodPostureRatioToday : day.goodPosturePct,
          slouchCount: stats.slouchIncidentsCount > 0 ? stats.slouchIncidentsCount : day.slouchCount,
        }
      : day
  );

  return (
    <div className="space-y-6 pb-12">
      {/* 1. KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Good Posture Ratio */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 backdrop-blur-md shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold">Good Posture Ratio</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100 tracking-tight">
              {goodPostureRatioToday}%
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +5.2% vs wk
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Target: ≥75% daily alignment threshold
          </p>
        </div>

        {/* KPI 2: Total Sitting Hours */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 backdrop-blur-md shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold">Sitting Duration (Today)</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100 tracking-tight">
              {totalSittingHoursToday} hrs
            </span>
            <span className="text-xs text-slate-400">
              of 8h workday
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Breaks completed: {stats.continuousSittingSeconds === 0 ? '5 active breaks' : '4 active breaks'}
          </p>
        </div>

        {/* KPI 3: Slouch Incidents Count */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 backdrop-blur-md shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold">Slouch Incidents</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100 tracking-tight">
              {stats.slouchIncidentsCount}
            </span>
            <span className="text-xs text-amber-400 font-semibold">
              avg 38s duration
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Grace period saved 12 potential penalties
          </p>
        </div>

        {/* KPI 4: Ergonomic Risk Score */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 backdrop-blur-md shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold">Ergonomic Risk Index</span>
            <div className={`p-1.5 rounded-lg border ${risk.bg}`}>
              <Activity className={`w-4 h-4 ${risk.color}`} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black ${risk.color}`}>
              {risk.level}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-1">
            {risk.desc}
          </p>
        </div>
      </div>

      {/* 2. Charts Section: 7-Day Trend Chart & 24h Fatigue Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Trend Chart */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" /> 7-Day Trend: Sitting vs Good Posture %
              </h3>
              <p className="text-[11px] text-slate-400">
                Comparing daily sitting volume against spinal alignment adherence
              </p>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="dayName" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  yAxisId="left"
                  stroke="#0ea5e9"
                  fontSize={11}
                  domain={[0, 10]}
                  unit="h"
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981"
                  fontSize={11}
                  domain={[40, 100]}
                  unit="%"
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                />
                <ReferenceLine
                  yAxisId="right"
                  y={75}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  label={{ value: 'Target 75%', fill: '#f59e0b', fontSize: 10, position: 'top' }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="sittingHours"
                  name="Sitting Duration (Hrs)"
                  fill="#0284c7"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="goodPosturePct"
                  name="Good Posture (%)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Fatigue Distribution (24-Hour Breakdown) */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Hourly Fatigue Analysis (Workday)
              </h3>
              <p className="text-[11px] text-slate-400">
                Highlights post-lunch fatigue slump (13:00 - 15:00) with elevated slouch rates
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
              Peak: 13:00-15:00
            </span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyFatigue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" domain={[0, 60]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(value: number) => [`${value}% Slouch Ratio`, 'Fatigue Index']}
                />
                <ReferenceLine
                  y={30}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label={{ value: 'Danger >30%', fill: '#ef4444', fontSize: 10, position: 'right' }}
                />
                <Bar dataKey="slouchRatio" name="Slouch Ratio (%)" radius={[4, 4, 0, 0]}>
                  {hourlyFatigue.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isPeakFatigue ? '#f43f5e' : entry.slouchRatio > 25 ? '#f59e0b' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Team Co-op Boss Raid & Department Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Co-op Boss: Lord Kyphosis */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 rounded-2xl border border-purple-900/40 p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-800/40">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-xl shadow-lg">
                🐉
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-purple-200">
                  {teamBoss.name}
                </h3>
                <p className="text-[11px] text-purple-400 font-medium">
                  {teamBoss.title}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
              <Swords className="w-3 h-3" /> Raid Boss
            </span>
          </div>

          <div className="space-y-3 my-2">
            <p className="text-xs text-slate-300 leading-relaxed">
              {teamBoss.description}
            </p>

            {/* Boss HP Bar */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1 font-mono">
                <span className="text-purple-300 font-bold">Boss Health</span>
                <span className="text-rose-400 font-extrabold">
                  {Math.round(teamBoss.currentHp)} / {teamBoss.maxHp} HP
                </span>
              </div>
              <div className="w-full h-3.5 bg-slate-950 rounded-full p-0.5 border border-purple-900/60 overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-600 via-purple-600 to-pink-500 transition-all duration-500"
                  style={{ width: `${Math.max(0, (teamBoss.currentHp / teamBoss.maxHp) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/50 text-[11px] text-purple-200 flex items-center justify-between">
              <div>
                <span className="font-bold">Victory Reward:</span> +{teamBoss.rewardExp} EXP to all Guild members
              </div>
              <span className="text-purple-400 font-bold">{teamBoss.daysRemaining} days left</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 pt-3 border-t border-purple-900/30 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Good posture and 3m breaks continuously deal co-op damage!</span>
          </div>
        </div>

        {/* Department Leaderboard (Ranked by Break Consistency & Posture Score, NOT total sitting hours!) */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>Department Ergonomic Guild Leaderboard</span>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Health-First Scoring
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Ranked by <strong>Break Consistency</strong> and <strong>Posture Alignment %</strong> (overtime sitting is not rewarded)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Engineering & Product Guild</span>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Colleague</th>
                  <th className="py-2.5 px-3 text-center">Good Posture %</th>
                  <th className="py-2.5 px-3 text-center">Break Consistency</th>
                  <th className="py-2.5 px-3 text-right">Boss Damage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {leaderboard.map((member, idx) => (
                  <tr
                    key={member.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      member.isCurrentUser ? 'bg-emerald-500/10 font-bold' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-950 shadow-sm'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-950'
                              : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'text-slate-500 bg-slate-800'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{member.avatar}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-200 font-bold">{member.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-mono">
                              Lv.{member.level}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">{member.title}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold font-mono">
                        {member.goodPosturePct}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-bold font-mono">
                        {member.breakConsistencyPct}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-purple-300 font-bold">
                      {member.coopDamageContribution.toLocaleString()} DMG
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

