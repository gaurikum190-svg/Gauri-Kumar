import React, { useState, useEffect } from 'react';
import { DailyLog } from '../types';
import { BedDouble, Droplet, Footprints, Flame, Sparkles, Smile, ShieldCheck, Calendar } from 'lucide-react';

interface DailyCheckInProps {
  logs: DailyLog[];
  onSaveLog: (log: DailyLog) => void;
}

export default function DailyCheckIn({ logs, onSaveLog }: DailyCheckInProps) {
  // Select active date for logs (default to today local YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toLocaleDateString('en-CA') // outputs YYYY-MM-DD safely in local time
  );

  // Form states
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<DailyLog['sleepQuality']>('average');
  const [waterIntake, setWaterIntake] = useState<number>(4);
  const [steps, setSteps] = useState<number>(5000);
  const [exerciseMins, setExerciseMins] = useState<number>(15);
  const [mood, setMood] = useState<DailyLog['mood']>('happy');
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [journalNotes, setJournalNotes] = useState<string>('');

  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState<boolean>(false);

  // Load existing log if selectedDate changes
  useEffect(() => {
    const existingLog = logs.find(log => log.date === selectedDate);
    if (existingLog) {
      setSleepHours(existingLog.sleepHours);
      setSleepQuality(existingLog.sleepQuality);
      setWaterIntake(existingLog.waterIntake);
      setSteps(existingLog.steps);
      setExerciseMins(existingLog.exerciseMins);
      setMood(existingLog.mood);
      setStressLevel(existingLog.stressLevel);
      setJournalNotes(existingLog.journalNotes);
    } else {
      // Set sensible defaults
      setSleepHours(7.5);
      setSleepQuality('average');
      setWaterIntake(4);
      setSteps(5000);
      setExerciseMins(15);
      setMood('happy');
      setStressLevel(3);
      setJournalNotes('');
    }
    setIsSavedSuccessfully(false);
  }, [selectedDate, logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveLog({
      date: selectedDate,
      sleepHours,
      sleepQuality,
      waterIntake,
      steps,
      exerciseMins,
      mood,
      stressLevel,
      journalNotes,
    });
    setIsSavedSuccessfully(true);
    setTimeout(() => setIsSavedSuccessfully(false), 3000);
  };

  // Water increment/decrement helpers
  const handleWaterClick = (amt: number) => {
    setWaterIntake(prev => Math.max(0, Math.min(24, prev + amt)));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Date Selector & Title Header */}
      <div className="bg-white rounded-[24px] border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-4 shadow-none">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            Daily Health Check-in
          </h3>
          <p className="text-xs text-gray-400">Log habits daily to compute your wellness score and trends.</p>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-2 rounded-2xl">
          <Calendar className="w-4 h-4 text-gray-500 ml-1.5" />
          <input 
            id="checkin-date"
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-semibold text-gray-700 bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
            max={new Date().toLocaleDateString('en-CA')}
          />
        </div>
      </div>

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Restorative Sleep */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-4 shadow-none flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-indigo-500" />
              Restorative Sleep
            </h4>
            <p className="text-xs text-gray-400">Aim for 7 to 9 hours of quality restful sleep.</p>
          </div>

          <div className="space-y-4 my-2">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-gray-500">
                <span>Duration Spent Sleeping</span>
                <span className="font-mono text-indigo-600 font-bold">{sleepHours} hours</span>
              </div>
              <input 
                id="sleep-hours-range"
                type="range" 
                min="3" 
                max="14" 
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-gray-100 rounded-lg appearance-none"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-500 block">Sleep Quality Index</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'good', label: 'Good 😴', color: 'bg-indigo-50 text-indigo-700 border-indigo-100', activeColor: 'bg-indigo-600 text-white border-indigo-700' },
                  { id: 'average', label: 'Average 😐', color: 'bg-gray-50 text-gray-700 border-gray-100', activeColor: 'bg-gray-600 text-white border-gray-700' },
                  { id: 'poor', label: 'Poor 😵‍💫', color: 'bg-amber-50 text-amber-700 border-amber-100', activeColor: 'bg-amber-600 text-white border-amber-700' },
                ].map((item) => (
                  <button
                    key={item.id}
                    id={`sleep-quality-${item.id}-btn`}
                    type="button"
                    onClick={() => setSleepQuality(item.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${sleepQuality === item.id ? item.activeColor : item.color}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Hydration Tracker */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-4 shadow-none flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <Droplet className="w-5 h-5 text-blue-500 animate-bounce" />
              Water Hydration
            </h4>
            <p className="text-xs text-gray-400">Aim for at least 8 glasses (~2 Liters) of clean fluid.</p>
          </div>

          <div className="flex items-center justify-around py-2">
            <button 
              id="water-decrement-btn"
              type="button"
              onClick={() => handleWaterClick(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xl font-bold transition shadow-xs"
            >
              -
            </button>

            {/* Visual Glass Counter */}
            <div className="text-center space-y-1">
              <div className="flex gap-1 justify-center items-end h-8 min-w-[120px]">
                {Array.from({ length: Math.min(10, waterIntake) }).map((_, i) => (
                  <div 
                    key={i} 
                    className="w-2.5 bg-blue-400 border border-blue-500 rounded-b-sm animate-fade-in" 
                    style={{ height: `${20 + i * 4}px` }}
                  />
                ))}
                {waterIntake === 0 && (
                  <span className="text-xs text-gray-300 font-semibold font-mono">0 glasses logged</span>
                )}
              </div>
              <p className="text-lg font-black text-blue-950 font-mono">
                {waterIntake} <span className="text-xs font-normal text-gray-500">glasses</span>
              </p>
            </div>

            <button 
              id="water-increment-btn"
              type="button"
              onClick={() => handleWaterClick(1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xl font-bold transition shadow-xs"
            >
              +
            </button>
          </div>
        </div>

        {/* 3. Physical Footsteps */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-4 shadow-none">
          <div className="space-y-1">
            <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <Footprints className="w-5 h-5 text-sky-500" />
              Daily Steps
            </h4>
            <p className="text-xs text-gray-400">Aim for 8,000–10,000 steps to maintain vascular health.</p>
          </div>

          <div className="relative">
            <input 
              id="steps-input"
              type="number" 
              value={steps}
              onChange={(e) => setSteps(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition font-mono font-bold"
              min="0"
              max="100000"
            />
            <span className="absolute right-3.5 top-3 text-xs text-gray-400">steps today</span>
          </div>

          {/* Quick preset chips */}
          <div className="flex gap-2">
            {[3000, 5000, 8000, 10000].map((preset) => (
              <button
                key={preset}
                id={`steps-preset-${preset}-btn`}
                type="button"
                onClick={() => setSteps(preset)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${steps === preset ? 'bg-sky-500 text-white border-sky-600' : 'bg-gray-50 hover:bg-gray-100 text-gray-500 border-gray-200'}`}
              >
                {preset.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Cardiovascular Exercise */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-4 shadow-none">
          <div className="space-y-1">
            <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Active Exercise Minutes
            </h4>
            <p className="text-xs text-gray-400">World Health Organization recommends 30 mins moderate daily movement.</p>
          </div>

          <div className="relative">
            <input 
              id="exercise-mins-input"
              type="number" 
              value={exerciseMins}
              onChange={(e) => setExerciseMins(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-mono font-bold"
              min="0"
              max="1440"
            />
            <span className="absolute right-3.5 top-3 text-xs text-gray-400">minutes</span>
          </div>

          {/* Quick preset chips */}
          <div className="flex gap-2">
            {[10, 20, 30, 45, 60].map((preset) => (
              <button
                key={preset}
                id={`exercise-preset-${preset}-btn`}
                type="button"
                onClick={() => setExerciseMins(preset)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${exerciseMins === preset ? 'bg-orange-500 text-white border-orange-600' : 'bg-gray-50 hover:bg-gray-100 text-gray-500 border-gray-200'}`}
              >
                {preset}m
              </button>
            ))}
          </div>
        </div>

        {/* 5. Inner Wellness (Mood scale) */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-4 shadow-none">
          <div className="space-y-1">
            <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <Smile className="w-5 h-5 text-amber-500" />
              Today's Mood Status
            </h4>
            <p className="text-xs text-gray-400">Track and correlate emotional wellbeing over time.</p>
          </div>

          <div className="flex justify-around items-center">
            {[
              { id: 'sad', emoji: '😢', label: 'Melancholy' },
              { id: 'neutral', emoji: '😐', label: 'Neutral' },
              { id: 'happy', emoji: '🙂', label: 'Peaceful' },
              { id: 'joy', emoji: '😀', label: 'Vibrant' },
              { id: 'excited', emoji: '🔥', label: 'Unstoppable' },
            ].map((item) => (
              <button
                key={item.id}
                id={`mood-select-${item.id}-btn`}
                type="button"
                onClick={() => setMood(item.id as any)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition group ${mood === item.id ? 'bg-amber-50 border-amber-300 scale-110 shadow-xs' : 'bg-transparent border-transparent hover:bg-gray-50/50'}`}
              >
                <span className="text-3xl filter transition group-hover:scale-110 duration-150 leading-none">{item.emoji}</span>
                <span className={`text-[9px] font-bold tracking-tight ${mood === item.id ? 'text-amber-800' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 6. Stress Gauge */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-4 shadow-none flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="font-bold text-gray-800 text-base">Stress Load Factor</h4>
            <p className="text-xs text-gray-400">Scale of 1 (Absolute Calm) to 5 (Heavy Burnout).</p>
          </div>

          <div className="flex justify-between items-center px-2 py-3">
            {[1, 2, 3, 4, 5].map((level) => {
              const labels = ['Zen', 'Relaxed', 'Mild', 'Tense', 'Stressed'];
              const isActive = stressLevel === level;
              const colors = [
                'bg-emerald-500 border-emerald-600 text-white',
                'bg-emerald-400 border-emerald-500 text-white',
                'bg-amber-400 border-amber-500 text-white',
                'bg-orange-500 border-orange-600 text-white',
                'bg-rose-500 border-rose-600 text-white',
              ];
              return (
                <button
                  key={level}
                  id={`stress-select-${level}-btn`}
                  type="button"
                  onClick={() => setStressLevel(level)}
                  className={`flex flex-col items-center gap-1 p-1 w-12 rounded-xl transition border ${isActive ? colors[level - 1] : 'bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-400'}`}
                >
                  <span className="text-sm font-black font-mono leading-none">{level}</span>
                  <span className="text-[8px] font-bold tracking-tighter uppercase">{labels[level - 1]}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 7. Journal Notes */}
      <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-3 shadow-none">
        <label className="text-sm font-bold text-gray-800 block" htmlFor="journal-notes">Gratitude & Daily Reflection Journal</label>
        <p className="text-xs text-gray-400">Briefly capture what you are grateful for, emotional triggers, or physical feedback.</p>
        <textarea 
          id="journal-notes"
          value={journalNotes}
          onChange={(e) => setJournalNotes(e.target.value)}
          rows={3}
          className="w-full text-sm px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none placeholder:text-gray-300"
          placeholder="Today, I am grateful for... (e.g. delicious breakfast, great walk, feeling energized)"
        />
      </div>

      {/* Save Button with Success Notification */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#ECFDF5] border border-[#D1FAE5] p-5 rounded-[24px] shadow-none">
        <div className="flex items-center gap-2 text-emerald-800">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="text-xs font-semibold">
            {isSavedSuccessfully ? "✓ Daily logs saved successfully! Your Health Score is updated." : "All parameters will be written securely to device browser local storage."}
          </span>
        </div>
        <button
          id="save-daily-log-btn"
          type="submit"
          className="w-full md:w-auto px-7 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-2xl transition shadow-md active:scale-95"
        >
          Save Log Entry
        </button>
      </div>

    </form>
  );
}
