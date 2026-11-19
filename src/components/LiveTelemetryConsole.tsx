import React, { useState } from 'react';
import { usePostureQuest } from '../context/PostureQuestContext';
import {
  Terminal,
  Trash2,
  Filter,
  Code2,
  Copy,
  Check,
  Radio,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const LiveTelemetryConsole: React.FC = () => {
  const { logs, currentTelemetry, clearLogs } = usePostureQuest();
  const [filter, setFilter] = useState<'ALL' | 'EXP' | 'HP' | 'WARNING' | 'SYSTEM'>('ALL');
  const [showJsonInspector, setShowJsonInspector] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    if (filter === 'EXP') return log.type === 'EXP_GAIN' || log.type === 'BONUS' || log.type === 'LEVEL_UP';
    if (filter === 'HP') return log.type === 'HP_LOSS' || log.type === 'HP_HEAL' || log.type === 'BURNOUT';
    if (filter === 'WARNING') return log.type === 'WARNING' || log.type === 'DEBUFF';
    if (filter === 'SYSTEM') return log.type === 'SYSTEM' || log.type === 'MQTT';
    return true;
  });

  const copyJsonPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(currentTelemetry, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogTypeBadge = (type: string) => {
    switch (type) {
      case 'EXP_GAIN':
      case 'BONUS':
      case 'LEVEL_UP':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'WARNING':
      case 'DEBUFF':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'HP_LOSS':
      case 'BURNOUT':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'MQTT':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'SYSTEM':
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 backdrop-blur-md relative overflow-hidden shadow-lg flex flex-col h-full">
      {/* Header with Title & Filter Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-200">
                Live IoT Telemetry & Event Console
              </h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Raw MQTT telemetry stream & real-time gamification rules engine events
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Pills */}
          <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px] font-semibold">
            {(['ALL', 'EXP', 'HP', 'WARNING'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filter === category
                    ? 'bg-slate-800 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Toggle JSON Inspector */}
          <button
            onClick={() => setShowJsonInspector(!showJsonInspector)}
            className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Toggle MQTT Payload View"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>MQTT JSON</span>
            {showJsonInspector ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Clear Logs */}
          <button
            onClick={clearLogs}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Accordion: Raw MQTT Telemetry Payload Stream Inspector */}
      {showJsonInspector && (
        <div className="mb-3 bg-slate-950 rounded-xl p-3 border border-slate-800/90 text-xs font-mono relative">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Radio className="w-3.5 h-3.5" /> Topic: `smartchair/user_01/telemetry`
            </span>
            <button
              onClick={copyJsonPayload}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>
          <pre className="text-emerald-400 overflow-x-auto text-[11px] leading-tight">
            {JSON.stringify(currentTelemetry, null, 2)}
          </pre>
        </div>
      )}

      {/* Terminal Log Stream Window */}
      <div className="flex-1 bg-slate-950 rounded-xl p-3 border border-slate-800/90 font-mono text-xs overflow-y-auto max-h-[220px] min-h-[160px] space-y-2">
        {filteredLogs.map((log) => (
          <div key={log.id} className="flex items-start gap-2 hover:bg-slate-900/50 p-1 rounded transition-colors">
            <span className="text-slate-500 text-[10px] shrink-0 pt-0.5">[{log.timestamp}]</span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 border ${getLogTypeBadge(
                log.type
              )}`}
            >
              {log.type}
            </span>
            <span className="text-slate-300 text-xs break-all leading-relaxed">{log.message}</span>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="text-center py-6 text-slate-500 italic">No events matching current filter</div>
        )}
      </div>
    </div>
  );
};

