import React, { useState, useEffect, useCallback } from 'react';
import { usePostureQuest } from '../context/PostureQuestContext';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  Presentation,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface DemoStep {
  id: string;
  badge: string;
  title: string;
  description: string;
  durationSec: number;
  highlightTip: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 'good-posture',
    badge: 'STEP 1 • GOOD POSTURE',
    title: 'ท่านั่งถูกต้อง (Optimal Ergonomics)',
    description:
      'เซ็นเซอร์ ToF วัดระยะห่างจอ 62 cm และ Load Cell สมดุลซ้าย-ขวา 50/50 — ตัวละครหลังตรงสีเขียว ได้รับ +10 EXP/นาที พร้อมช่วยตี Boss ประจำสัปดาห์',
    durationSec: 7,
    highlightTip: 'สังเกตแทบ EXP ที่เพิ่มขึ้น และกระดูกสันหลังสีเขียวใน Avatar',
  },
  {
    id: 'slouch-grace',
    badge: 'STEP 2 • GRACE PERIOD (10s)',
    title: 'เริ่มหลังค่อม / นั่งเอียง (Warning Grace Period)',
    description:
      'เมื่อยื่นหน้าใกล้จอ (< 45 cm) หรือลงน้ำหนักเอียง ระบบจะให้เวลาเตือน 10 วินาที (สีส้ม) เพื่อปรับท่านั่งก่อนเริ่มหัก HP',
    durationSec: 6,
    highlightTip: 'สังเกตกระดูกสันหลังที่โค้งงอ และ Load Cell ฝั่งขวาที่ขึ้นสีแดง Overloaded',
  },
  {
    id: 'slouch-penalty',
    badge: 'STEP 3 • SLOUCH STRAIN',
    title: 'หลังค่อมต่อเนื่อง — หยุด EXP และลด -5 HP / 30 วิ',
    description:
      'เร่งความเร็วจำลองเป็น 10x เพื่อให้เห็นผลทันที: เมื่อเกิน 10 วินาที ระบบเปลี่ยนเป็นสีแดง หยุดการเพิ่ม EXP และหัก -5 HP ทุก 30 วินาทีพร้อมแจ้งเตือนใน Console',
    durationSec: 7,
    highlightTip: 'ดูแถบ HP ที่ลดลง และ Log แจ้งเตือนสีแดงใน Live Telemetry Console',
  },
  {
    id: 'overtime-debuff',
    badge: 'STEP 4 • SEDENTARY OVERTIME',
    title: 'นั่งแช่เกิน 45 นาที (Overtime Debuff)',
    description:
      'จำลองการนั่งต่อเนื่องครบ 45 นาที วงแหวน Session Timer เปลี่ยนเป็นสีแดง ติดสถานะ Sedentary Overtime (ลด EXP ลง 50% และเลือดลด -2 HP/นาที จนกว่าจะลุกขึ้น)',
    durationSec: 7,
    highlightTip: 'ดูวงแหวน Timer 45:00 และ Debuff badge ที่ใต้แถบ EXP',
  },
  {
    id: 'active-break',
    badge: 'STEP 5 • ACTIVE BREAK BONUS',
    title: 'ลุกพักเดิน 3 นาที — รับโบนัส +100 EXP & +20 HP!',
    description:
      'เมื่อลุกออกจากเก้าอี้ครบ 3 นาทีหลังนั่งนาน ระบบจะแจกโบนัส +100 EXP ฟื้นฟู +20 HP ล้าง Debuff ทั้งหมด และรีเซ็ตเวลานั่งกลับเป็น 00:00',
    durationSec: 7,
    highlightTip: 'ดู Log สีเขียว [BONUS] และ HP ที่ฟื้นคืนกลับมา',
  },
  {
    id: 'analytics-boss',
    badge: 'STEP 6 • ANALYTICS & TEAM CO-OP',
    title: 'แดชบอร์ดวิเคราะห์สุขภาพ & ตีบอสประจำทีม',
    description:
      'สลับมาหน้า Analytics: ดูกราฟ 7 วัน, ช่วงบ่ายหลังอาหารที่มักหลังค่อม (13:00–15:00), ตารางอันดับที่วัดจากความสม่ำเสมอในการลุกพัก และบอส Lord Kyphosis',
    durationSec: 9,
    highlightTip: 'ลองเลื่อนลงดู Department Leaderboard และหลอดเลือด Boss ด้านล่าง',
  },
];

export const DemoTourOverlay: React.FC = () => {
  const {
    demoMode,
    setDemoMode,
    setActiveTab,
    setSimulatorDrawerOpen,
    setTimeMultiplier,
    applyPresetGoodPosture,
    applyPresetSlouching,
    fastForward45mSitting,
    simulate3mBreak,
    dismissLevelUp,
  } = usePostureQuest();

  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  const currentStep = DEMO_STEPS[stepIndex];

  // Execute the scripted IoT & UI actions for a given step
  const runStepAction = useCallback(
    (idx: number) => {
      dismissLevelUp();
      setSecondsElapsed(0);

      switch (idx) {
        case 0: // Good Posture
          setActiveTab('quest');
          setSimulatorDrawerOpen(true);
          setTimeMultiplier(10);
          applyPresetGoodPosture();
          break;
        case 1: // Slouch Grace Period
          setActiveTab('quest');
          setTimeMultiplier(1);
          applyPresetSlouching();
          break;
        case 2: // Slouch Penalty
          setActiveTab('quest');
          setTimeMultiplier(10);
          applyPresetSlouching();
          break;
        case 3: // Sedentary Overtime
          setActiveTab('quest');
          setTimeMultiplier(1);
          applyPresetGoodPosture();
          fastForward45mSitting();
          break;
        case 4: // Active Break Bonus
          setActiveTab('quest');
          setTimeMultiplier(1);
          simulate3mBreak();
          break;
        case 5: // Analytics & Team Boss
          setTimeMultiplier(1);
          setActiveTab('analytics');
          setSimulatorDrawerOpen(false);
          break;
      }
    },
    [
      setActiveTab,
      setSimulatorDrawerOpen,
      setTimeMultiplier,
      applyPresetGoodPosture,
      applyPresetSlouching,
      fastForward45mSitting,
      simulate3mBreak,
      dismissLevelUp,
    ]
  );

  // Trigger step 0 when Demo Mode starts
  useEffect(() => {
    if (demoMode) {
      setStepIndex(0);
      setIsPaused(false);
      runStepAction(0);
    }
  }, [demoMode]);

  // Auto-advance timer
  useEffect(() => {
    if (!demoMode || isPaused) return;

    const timer = setInterval(() => {
      setSecondsElapsed((prev) => {
        if (prev + 1 >= currentStep.durationSec) {
          if (stepIndex < DEMO_STEPS.length - 1) {
            const nextIdx = stepIndex + 1;
            setStepIndex(nextIdx);
            runStepAction(nextIdx);
            return 0;
          } else {
            // Reached end of tour -> pause on final step so presenter can explore
            setIsPaused(true);
            return currentStep.durationSec;
          }
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [demoMode, isPaused, stepIndex, currentStep.durationSec, runStepAction]);

  if (!demoMode) return null;

  const handleNext = () => {
    if (stepIndex < DEMO_STEPS.length - 1) {
      const nextIdx = stepIndex + 1;
      setStepIndex(nextIdx);
      runStepAction(nextIdx);
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      const prevIdx = stepIndex - 1;
      setStepIndex(prevIdx);
      runStepAction(prevIdx);
    }
  };

  const handleRestart = () => {
    setStepIndex(0);
    setIsPaused(false);
    runStepAction(0);
  };

  const handleExit = () => {
    setTimeMultiplier(1);
    setDemoMode(false);
  };

  const stepProgressPct = Math.min(100, Math.round((secondsElapsed / currentStep.durationSec) * 100));
  const isFinished = stepIndex === DEMO_STEPS.length - 1 && isPaused && secondsElapsed >= currentStep.durationSec;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-2xl">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-emerald-500/50 rounded-2xl shadow-2xl shadow-emerald-950/60 overflow-hidden">
        {/* Top Progress Bar */}
        <div className="w-full h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all duration-1000 ease-linear"
            style={{ width: `${stepProgressPct}%` }}
          />
        </div>

        <div className="p-4">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold tracking-wider">
                <Presentation className="w-3 h-3" />
                {currentStep.badge}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {stepIndex + 1} / {DEMO_STEPS.length}
              </span>
            </div>

            {/* Step Dots */}
            <div className="hidden sm:flex items-center gap-1.5">
              {DEMO_STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setStepIndex(i);
                    runStepAction(i);
                  }}
                  title={s.title}
                  className={`h-2 rounded-full transition-all ${
                    i === stepIndex
                      ? 'w-6 bg-emerald-400'
                      : i < stepIndex
                      ? 'w-2 bg-emerald-600/80'
                      : 'w-2 bg-slate-700 hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleExit}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Exit Demo Mode"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-3">
            <h4 className="text-sm sm:text-base font-extrabold text-slate-100 mb-1 flex items-center gap-2">
              <span>{currentStep.title}</span>
              {isFinished && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> จบการสาธิต
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">{currentStep.description}</p>
            <p className="text-[11px] text-cyan-300/90 mt-1.5 font-medium">
              💡 {currentStep.highlightTip}
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                disabled={stepIndex === 0}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold text-slate-200 transition-colors"
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span>ย้อนกลับ</span>
              </button>

              {isFinished ? (
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>เล่น Demo อีกครั้ง</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md transition-colors"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isPaused ? 'เล่นต่อ' : 'หยุดชั่วคราว'}</span>
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={stepIndex === DEMO_STEPS.length - 1}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold text-slate-200 transition-colors"
              >
                <span>ถัดไป</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleExit}
              className="text-xs font-medium text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
            >
              ปิด Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

