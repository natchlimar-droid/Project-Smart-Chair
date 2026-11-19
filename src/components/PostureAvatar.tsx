import React from 'react';
import { usePostureQuest } from '../context/PostureQuestContext';
import { ShieldCheck, AlertCircle, AlertTriangle, UserMinus, Eye, Layers } from 'lucide-react';

export const PostureAvatar: React.FC = () => {
  const {
    isOccupied,
    distanceCm,
    balanceLeftPct,
    balanceRightPct,
    postureState,
    stats,
  } = usePostureQuest();

  // Mathematical interpolation of spine curvature based on distance_cm
  // distance: 30cm (severe slouch) -> 80cm (fully upright/extended)
  // Normalization 0 (extreme slouch) to 1 (perfect upright)
  const uprightFactor = Math.max(0, Math.min(1, (distanceCm - 30) / 40));

  // Torso / Spine parameters
  // Head X position: at 80cm distance it sits back at X: 155, at 30cm it leans forward to X: 195
  const headX = isOccupied ? 195 - uprightFactor * 40 : 155;
  // Head Y position: dips down slightly when slouching
  const headY = isOccupied ? 88 + (1 - uprightFactor) * 14 : 85;

  // Neck angle calculation (degrees from vertical)
  const neckAngleDeg = isOccupied ? Math.round(12 + (1 - uprightFactor) * 32) : 10;

  // Mid-spine curvature control point (thoracic vertebrae)
  const spineControlX = isOccupied ? 128 - (1 - uprightFactor) * 22 : 128;
  const spineControlY = 145;

  // Pelvic tilt angle based on balance left vs right
  // If left = 50%, angle = 0deg. If left = 20%, angle = -12deg. If left = 80%, angle = +12deg.
  const pelvicTiltDeg = isOccupied ? ((balanceLeftPct - 50) / 30) * 12 : 0;

  // Status-based styling
  const getStatusTheme = () => {
    switch (postureState) {
      case 'GOOD_POSTURE':
        return {
          glow: 'shadow-emerald-500/20 ring-emerald-500/30 border-emerald-500/40',
          accent: '#10b981',
          accentBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          label: 'Spine Aligned (Neutral S-Curve)',
          icon: ShieldCheck,
        };
      case 'WARNING_POSTURE':
        return {
          glow: 'shadow-amber-500/25 ring-amber-500/40 border-amber-500/50',
          accent: '#f59e0b',
          accentBg: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
          label: `Grace Period Warning (${Math.max(0, 10 - stats.slouchWarningSeconds)}s remaining)`,
          icon: AlertCircle,
        };
      case 'SLOUCHING':
        return {
          glow: 'shadow-rose-500/30 ring-rose-500/50 border-rose-500/60 animate-pulse',
          accent: '#f43f5e',
          accentBg: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
          label: 'High Spinal Strain (Kyphosis & Pelvic Tilt)',
          icon: AlertTriangle,
        };
      case 'BURNOUT_EXHAUSTED':
        return {
          glow: 'shadow-purple-500/30 ring-purple-500/40 border-purple-500/50',
          accent: '#a855f7',
          accentBg: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
          label: 'Character Exhausted (Break Required)',
          icon: AlertTriangle,
        };
      case 'IDLE_AWAY':
      default:
        return {
          glow: 'shadow-slate-800 ring-slate-700/40 border-slate-700',
          accent: '#64748b',
          accentBg: 'bg-slate-800 text-slate-400 border-slate-700',
          label: 'Chair Empty / User Standing',
          icon: UserMinus,
        };
    }
  };

  const theme = getStatusTheme();
  const StatusIcon = theme.icon;

  // Posture Score calculation (0 - 100%)
  const postureScore = isOccupied
    ? Math.round(
        (Math.min(1, distanceCm / 60) * 0.6 +
          (1 - Math.abs(balanceLeftPct - 50) / 50) * 0.4) *
          100
      )
    : 0;

  return (
    <div
      className={`bg-slate-900/90 rounded-2xl border p-5 backdrop-blur-md relative overflow-hidden transition-all duration-300 ${theme.glow}`}
    >
      {/* Background ambient lighting */}
      <div
        className="absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: theme.accent }}
      />

      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              Live Biomechanical Posture Avatar
            </h3>
            <p className="text-[11px] text-slate-400">
              Real-time spinal curvature, cervical tilt & load distribution
            </p>
          </div>
        </div>

        {/* Real-time Status Chip */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${theme.accentBg}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{theme.label}</span>
        </div>
      </div>

      {/* Avatar Visual Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
        {/* Main Side Profile SVG Visualization (Span 2 cols) */}
        <div className="lg:col-span-2 relative bg-slate-950/60 rounded-xl border border-slate-800/80 p-3 flex flex-col items-center justify-center min-h-[280px]">
          {/* Laser beam ToF overlay indicator */}
          {isOccupied && (
            <div className="absolute top-12 right-6 flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 text-[11px] font-mono text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>ToF Beam: {distanceCm} cm</span>
            </div>
          )}

          <svg
            viewBox="0 0 340 260"
            className="w-full max-w-[340px] h-[240px] select-none"
            aria-label="Ergonomic Sitting Simulation"
          >
            <defs>
              <linearGradient id="spineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={theme.accent} />
                <stop offset="50%" stopColor={theme.accent} stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>

              <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
              </linearGradient>

              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>

            {/* Background alignment grid */}
            <rect width="340" height="260" fill="url(#grid)" opacity="0.5" />

            {/* Floor line */}
            <line x1="20" y1="230" x2="320" y2="230" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

            {/* Office Desk & Monitor */}
            <g id="workstation">
              {/* Desk Surface */}
              <rect x="235" y="140" width="85" height="8" rx="2" fill="#334155" />
              {/* Desk Legs */}
              <line x1="250" y1="148" x2="250" y2="230" stroke="#1e293b" strokeWidth="4" />
              <line x1="310" y1="148" x2="310" y2="230" stroke="#1e293b" strokeWidth="4" />
              {/* Monitor Stand */}
              <rect x="270" y="100" width="6" height="40" fill="#475569" />
              <rect x="260" y="137" width="26" height="3" fill="#64748b" />
              {/* Monitor Screen */}
              <rect x="272" y="62" width="6" height="62" rx="2" fill="#0ea5e9" />
              <path d="M 272 65 L 268 70 L 268 120 L 272 122 Z" fill="#38bdf8" opacity="0.8" />
              {/* ToF Sensor Module */}
              <rect x="268" y="88" width="4" height="6" fill="#f43f5e" />
            </g>

            {/* Ergonomic Task Chair */}
            <g id="chair">
              {/* Chair Base & Casters */}
              <ellipse cx="140" cy="226" rx="28" ry="4" fill="#1e293b" />
              <line x1="140" y1="185" x2="140" y2="225" stroke="#334155" strokeWidth="5" />
              {/* Seat Pan */}
              <rect x="105" y="180" width="65" height="10" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
              {/* Chair Backrest */}
              <path
                d="M 106 182 Q 95 130 102 95"
                fill="none"
                stroke="#334155"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 106 182 Q 95 130 102 95"
                fill="none"
                stroke="#475569"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Lumbar cushion indicator */}
              <ellipse cx="101" cy="148" rx="4" ry="10" fill="#0ea5e9" opacity="0.6" />
            </g>

            {/* Human Biomechanical Skeleton (Rendered when occupied) */}
            {isOccupied ? (
              <g id="avatar" className="transition-all duration-300">
                {/* ToF Laser Distance Beam (from monitor to user head) */}
                <line
                  x1="268"
                  y1="90"
                  x2={headX + 10}
                  y2={headY}
                  stroke="url(#beamGradient)"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />

                {/* Pelvis / Thigh (resting on seat) */}
                <g transform={`rotate(${pelvicTiltDeg} 135 180)`}>
                  {/* Pelvic base */}
                  <ellipse cx="130" cy="178" rx="14" ry="7" fill="#475569" />
                  {/* Thigh (horizontal forward) */}
                  <line x1="130" y1="178" x2="190" y2="178" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                  {/* Lower Leg & Foot */}
                  <line x1="190" y1="178" x2="192" y2="228" stroke="#475569" strokeWidth="10" strokeLinecap="round" />
                  <ellipse cx="202" cy="228" rx="14" ry="4" fill="#334155" />
                </g>

                {/* Dynamic Spine Vertebrae (Quadratic Bezier curve) */}
                {/* Starts at Pelvis (130, 175) -> passes Control Point -> Neck/Shoulders */}
                <path
                  d={`M 130 175 Q ${spineControlX} ${spineControlY} ${headX - 16} ${headY + 28}`}
                  fill="none"
                  stroke="url(#spineGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />

                {/* Cervical Spine (Neck) */}
                <line
                  x1={headX - 16}
                  y1={headY + 28}
                  x2={headX - 4}
                  y2={headY + 12}
                  stroke={theme.accent}
                  strokeWidth="5"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />

                {/* Head / Cranium */}
                <circle
                  cx={headX}
                  cy={headY}
                  r="14"
                  fill="#1e293b"
                  stroke={theme.accent}
                  strokeWidth="3"
                  className="transition-all duration-300"
                />

                {/* Face direction / Eyeline towards screen */}
                <line
                  x1={headX + 5}
                  y1={headY - 1}
                  x2={headX + 13}
                  y2={headY - 1}
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Forward arm typing on keyboard */}
                <path
                  d={`M ${headX - 12} ${headY + 34} Q ${headX + 15} ${headY + 45} 242 140`}
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="5"
                  strokeLinecap="round"
                />

                {/* Vertebrae Stress Nodes (visualized dots along spine) */}
                <circle cx="130" cy="172" r="3" fill="#3b82f6" />
                <circle cx={spineControlX + 2} cy={spineControlY + 6} r="3.5" fill={theme.accent} />
                <circle cx={headX - 15} cy={headY + 26} r="3" fill={theme.accent} />
              </g>
            ) : (
              /* Ghost / Unoccupied Chair visual */
              <g id="ghost-avatar">
                <text x="110" y="145" fill="#475569" fontSize="12" fontWeight="bold">
                  Stand / Away
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Right Metric Column: Load Cells & Angle Telemetry */}
        <div className="flex flex-col gap-3">
          {/* 1. Posture Alignment Metric */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Alignment Score</span>
              <span className="font-bold text-slate-200">{postureScore}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${postureScore}%`,
                  backgroundColor: theme.accent,
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-[11px] text-slate-400">
              <span>Neck Lean:</span>
              <span className={`font-mono font-bold ${neckAngleDeg > 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {neckAngleDeg}° {neckAngleDeg > 25 ? '(Kyphosis Strain)' : '(Neutral)'}
              </span>
            </div>
          </div>

          {/* 2. Dual Load-Cell Seat Pressure Heatmap */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-400" /> Seat Load Distribution
              </span>
              <span
                className={`text-[11px] font-bold ${
                  Math.abs(balanceLeftPct - 50) <= 5 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {Math.abs(balanceLeftPct - 50) <= 5 ? 'Balanced' : 'Imbalanced'}
              </span>
            </div>

            {/* Load cell dual pads representation */}
            <div className="grid grid-cols-2 gap-2 text-center">
              {/* Left Load Cell */}
              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  balanceLeftPct > 55
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : balanceLeftPct >= 45
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase">Left Cell</div>
                <div className="text-sm font-mono font-extrabold">{balanceLeftPct}%</div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  {balanceLeftPct > 55 ? 'Overloaded' : balanceLeftPct < 45 ? 'Underloaded' : 'Optimal'}
                </div>
              </div>

              {/* Right Load Cell */}
              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  balanceRightPct > 55
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : balanceRightPct >= 45
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase">Right Cell</div>
                <div className="text-sm font-mono font-extrabold">{balanceRightPct}%</div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  {balanceRightPct > 55 ? 'Overloaded' : balanceRightPct < 45 ? 'Underloaded' : 'Optimal'}
                </div>
              </div>
            </div>

            <div className="mt-2 text-[10px] text-slate-500 text-center">
              Recommended: 45% - 55% symmetrical distribution
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

