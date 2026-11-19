import React from 'react';
import { PostureQuestProvider, usePostureQuest } from './context/PostureQuestContext';
import { Header } from './components/Header';
import { SimulatorControlBar } from './components/SimulatorControlBar';
import { QuestDashboardView } from './components/QuestDashboardView';
import { AnalyticsView } from './components/AnalyticsView';
import { BurnoutModal } from './components/BurnoutModal';
import { LevelUpModal } from './components/LevelUpModal';
import { DemoTourOverlay } from './components/DemoTourOverlay';

const MainContent: React.FC = () => {
  const { activeTab } = usePostureQuest();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />
      <SimulatorControlBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'quest' ? <QuestDashboardView /> : <AnalyticsView />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PostureQuest • IoT Ergonomics & Gamification Architecture</span>
          <span className="text-[11px] text-slate-600">
            ESP32 / Time-of-Flight LiDAR / 4-Channel Load Cells / MQTT v3.1.1
          </span>
        </div>
      </footer>

      <BurnoutModal />
      <LevelUpModal />
      <DemoTourOverlay />
    </div>
  );
};

export function App() {
  return (
    <PostureQuestProvider>
      <MainContent />
    </PostureQuestProvider>
  );
}

export default App;

