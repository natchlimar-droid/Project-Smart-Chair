import React from 'react';
import { PostureAvatar } from './PostureAvatar';
import { RpgStatsCard } from './RpgStatsCard';
import { SessionTimerCard } from './SessionTimerCard';
import { LiveTelemetryConsole } from './LiveTelemetryConsole';

export const QuestDashboardView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* 1. Dynamic Posture Avatar & Biomechanical Visualizer */}
      <section aria-label="Biomechanical Posture Avatar">
        <PostureAvatar />
      </section>

      {/* 2. Middle Row: RPG Stats & Session Sedentary Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section aria-label="RPG Stats Card">
          <RpgStatsCard />
        </section>
        <section aria-label="Session Timer Card">
          <SessionTimerCard />
        </section>
      </div>

      {/* 3. Bottom Row: Live IoT Telemetry Console & MQTT Inspector */}
      <section aria-label="Live IoT Telemetry Console">
        <LiveTelemetryConsole />
      </section>
    </div>
  );
};

