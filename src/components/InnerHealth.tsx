import React, { useState, useEffect, useMemo } from 'react';
import { DailyLog } from '../types';
import { Wind, Droplet, BookOpen, Quote, ShieldAlert, Sparkles, Smile, History, Plus, Minus } from 'lucide-react';

interface InnerHealthProps {
  logs: DailyLog[];
  onSaveLog: (log: DailyLog) => void;
}

export default function InnerHealth({ logs, onSaveLog }: InnerHealthProps) {
  // 1. Mindfulness Breathing Timer States
  const [breathingActive, setBreathingActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Ready'>('Ready');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  // 4-7-8 Timing loop
  useEffect(() => {
    let interval: any = null;

    if (breathingActive) {
      if (breathPhase === 'Ready') {
        setBreathPhase('Inhale');
        setPhaseSecondsLeft(4);
      }

      interval = setInterval(() => {
        setPhaseSecondsLeft((prev) => {
          if (prev <= 1) {
            // Transition phases
            if (breathPhase === 'Inhale') {
              setBreathPhase('Hold');
              return 7;
            } else if (breathPhase === 'Hold') {
              setBreathPhase('Exhale');
              return 8;
            } else {
              setBreathPhase('Inhale');
              setCompletedCycles((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [breathingActive, breathPhase]);

  const handleStartBreathing = () => {
    setBreathingActive(true);
    setBreathPhase('Inhale');
    setPhaseSecondsLeft(4);
    setCompletedCycles(0);
  };

  const handleStopBreathing = () => {
    setBreathingActive(false);
    setBreathPhase('Ready');
    setPhaseSecondsLeft(4);
  };

  // 2. Local Hydration Fast click handler
  const todayDateStr = new Date().toLocaleDateString('en-CA');
  
  const todayLog = useMemo(() => {
    return logs.find(log => log.date === todayDateStr);
  }, [logs, todayDateStr]);

  const handleQuickWater = (amt: number) => {
    if (todayLog) {
      onSaveLog({
        ...todayLog,
        waterIntake: Math.max(0, Math.min(24, todayLog.waterIntake + amt))
      });
    } else {
      onSaveLog({
        date: todayDateStr,
        sleepHours: 8,
        sleepQuality: 'average',
        waterIntake: Math.max(0, amt),
        steps: 0,
        exerciseMins: 0,
        mood: 'happy',
        stressLevel: 2,
        journalNotes: '',
      });
    }
  };

  // 3. Filter logs with journal notes
  const journalLogs = useMemo(() => {
    return [...logs]
      .filter(log => log.journalNotes.trim().length > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs]);

  // Dynamic animation scale for breathing circle
  const circleScale = useMemo(() => {
    if (!breathingActive) return 'scale-100';
    if (breathPhase === 'Inhale') return 'scale-[1.75] duration-[4000ms]';
    if (breathPhase === 'Hold') return 'scale-[1.75] duration-500 animate-pulse';
    if (breathPhase === 'Exhale') return 'scale-100 duration-[8000ms]';
    return 'scale-100';
  }, [breathingActive, breathPhase]);

  const phaseInstruction = useMemo(() => {
    if (breathPhase === 'Inhale') return "Breathe in through your nose slowly...";
    if (breathPhase === 'Hold') return "Hold and feel the air oxygenate...";
    if (breathPhase === 'Exhale') return "Exhale completely making a whoosh sound...";
    return "Click start to begin the 4-7-8 relaxing protocol";
  }, [breathPhase]);

  // Mental Wellness Tips database
  const wellnessTips = [
    {
      category: "Stress Mitigation",
      tips: [
        "Box Breathing: Inhale for 4s, hold for 4s, exhale for 4s, hold empty for 4s. Instantly downsizes adrenaline spikes.",
        "Sensory Grounding: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste.",
        "Cognitive Reframe: Is this stressor a permanent block, or a temporary hurdle? Focus purely on what is within direct control.",
      ]
    },
    {
      category: "Restorative Sleep Hygiene",
      tips: [
        "Digital Sunset: Power down blue-light devices at least 60 minutes before bedroom entry.",
        "Adenosine Alignment: Sleep and wake at the exact same hour daily to stabilize circadian rhythms.",
        "Thermal Dropping: Sleep in a cool room (around 65°F / 18°C) to stimulate physiological melatonin triggers.",
      ]
    },
    {
      category: "Gratitude & Mindfulness",
      tips: [
        "Savoring: Spend 30 seconds intensely absorbing the beauty of a simple micro-moment (warm coffee, soft breeze, green plants).",
        "Gratitude Letters: Send a random message of thankfulness to a friend or colleague detailing exactly how they helped you.",
        "Body Scan Meditation: Focus awareness from your toes up to your scalp, releasing physical tension points on exhales.",
      ]
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Mindfulness Breathing Exercises */}
      <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-none flex flex-col items-center">
        <div className="text-center space-y-1.5 max-w-md">
          <h3 className="text-lg font-bold text-gray-800 flex items-center justify-center gap-2">
            <Wind className="w-5.5 h-5.5 text-teal-500" />
            4-7-8 Mindfulness Breathing
          </h3>
          <p className="text-xs text-gray-400">
            A natural tranquilizer for the nervous system. Inhale 4s, Hold 7s, Exhale 8s. Stabilizes heart rate variability (HRV).
          </p>
        </div>

        {/* Breathing Animation Canvas */}
        <div className="h-64 my-6 flex items-center justify-center relative w-full overflow-hidden rounded-2xl bg-teal-50/20 border border-teal-100/10">
          
          {/* Inner pulse circle */}
          <div 
            className={`w-20 h-20 bg-teal-400/25 border-4 border-teal-400 rounded-full flex items-center justify-center transition-all ease-linear ${circleScale}`}
          />

          {/* Absolute labels inside or on top */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <span className="text-sm font-black text-teal-950 tracking-wider uppercase mb-1">
              {breathPhase}
            </span>
            <span className="text-3xl font-extrabold text-teal-800 font-mono">
              {breathingActive ? `${phaseSecondsLeft}s` : "0s"}
            </span>
            <span className="text-xs text-teal-600/90 font-medium mt-3 max-w-xs transition-opacity duration-300">
              {phaseInstruction}
            </span>
          </div>

          {/* Cycles count tag */}
          {completedCycles > 0 && (
            <div className="absolute right-4 bottom-4 bg-teal-50 text-teal-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-teal-100">
              Completed Cycles: {completedCycles}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex gap-3">
          {!breathingActive ? (
            <button
              id="start-breathing-btn"
              onClick={handleStartBreathing}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-xl transition shadow-md active:scale-95"
            >
              Start Breathing Loop
            </button>
          ) : (
            <button
              id="stop-breathing-btn"
              onClick={handleStopBreathing}
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition shadow-md active:scale-95"
            >
              Stop & Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Quick Fluid Tracker */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 flex flex-col justify-between shadow-none">
          <div className="space-y-1">
            <h4 className="font-bold text-gray-800 text-base flex items-center gap-1.5">
              <Droplet className="w-5 h-5 text-blue-500" />
              Quick Hydrate
            </h4>
            <p className="text-xs text-gray-400">Log fluid intake instantly for today's count.</p>
          </div>

          <div className="my-5 flex items-center justify-between bg-blue-50/30 p-4 rounded-2xl border border-blue-100/50">
            <button 
              id="quick-water-minus-btn"
              onClick={() => handleQuickWater(-1)}
              className="p-1.5 bg-white hover:bg-gray-50 border border-gray-100 rounded-lg shadow-2xs text-blue-600 transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="text-center">
              <span className="text-2xl font-black text-blue-950 font-mono">
                {todayLog?.waterIntake || 0}
              </span>
              <span className="text-[10px] text-gray-400 block font-semibold">Glasses today</span>
            </div>
            <button 
              id="quick-water-plus-btn"
              onClick={() => handleQuickWater(1)}
              className="p-1.5 bg-white hover:bg-gray-50 border border-gray-100 rounded-lg shadow-2xs text-blue-600 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10px] text-gray-400 text-center leading-normal">
            8 glasses of pure spring water optimizes brain function and tissue elasticity.
          </p>
        </div>

        {/* Reflection Journal Logs (Scrollable Column) */}
        <div className="md:col-span-2 bg-white rounded-[24px] border border-slate-200 p-6 shadow-none flex flex-col justify-between">
          <div className="space-y-1 mb-3">
            <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-500" />
              My Journal Reflections
            </h4>
            <p className="text-xs text-gray-400">Recent logs containing gratitude reflections and notes.</p>
          </div>

          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {journalLogs.length > 0 ? (
              journalLogs.map((log, idx) => (
                <div key={idx} className="p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                    <span className="font-sans">
                      {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full">
                        Stress Level: {log.stressLevel}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 italic leading-relaxed">
                    "{log.journalNotes}"
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 text-xs">
                No journal reflections written yet. Start by logging one in the "Daily Check-in" form!
              </div>
            )}
          </div>

          <div className="border-t border-gray-100/50 mt-3 pt-3 flex items-center gap-1.5 text-[10px] text-emerald-700">
            <Quote className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>"Cultivating mental clarity turns health tracking into self-compassion."</span>
          </div>
        </div>
      </div>

      {/* Structured Health Tips Grid */}
      <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-none space-y-4">
        <div className="space-y-1">
          <h4 className="font-bold text-gray-800 text-base flex items-center gap-1.5">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            Clinical Mental Wellness Catalog
          </h4>
          <p className="text-xs text-gray-400">Scientifically proven lifestyle habits to decrease daily sympathetic load.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {wellnessTips.map((category, idx) => (
            <div key={idx} className="bg-gray-50/40 p-4 rounded-2xl border border-gray-100 space-y-3">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">{category.category}</span>
              <ul className="space-y-2.5">
                {category.tips.map((tip, tIdx) => (
                  <li key={tIdx} className="text-xs text-gray-600 leading-relaxed pl-2.5 relative">
                    <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
