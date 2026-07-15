import { useMemo } from 'react';
import { UserProfile, DailyLog, WeightLog } from '../types';
import { calculateHealthScore, calculateBMI } from '../utils/calculations';
import { Flame, Target, Trophy, Droplets, BedDouble, Footprints, MessageSquareHeart, ShieldAlert } from 'lucide-react';
import WeightTrendChart from './WeightTrendChart';

interface DashboardProps {
  profile: UserProfile;
  dailyLogs: DailyLog[];
  weightLogs: WeightLog[];
  onNavigate: (tab: 'metrics' | 'checkin' | 'inner' | 'outer' | 'plan') => void;
}

export default function Dashboard({ profile, dailyLogs, weightLogs, onNavigate }: DashboardProps) {
  // Sort logs
  const sortedWeightLogs = useMemo(() => {
    return [...weightLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [weightLogs]);

  // Calculations
  const { score: healthScore, breakdown } = useMemo(() => {
    return calculateHealthScore(profile, dailyLogs);
  }, [profile, dailyLogs]);

  const bmiDetails = useMemo(() => {
    return calculateBMI(profile.weight, profile.height);
  }, [profile.weight, profile.height]);

  const latestDailyLog = useMemo(() => {
    if (dailyLogs.length === 0) return null;
    const sorted = [...dailyLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0];
  }, [dailyLogs]);

  // Streak counter: consecutive days of check-ins
  const streak = useMemo(() => {
    if (dailyLogs.length === 0) return 0;
    
    // Sort log dates ascending and filter unique
    const uniqueDates = Array.from(new Set(dailyLogs.map(log => log.date)))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // descending order

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const firstLogDate = new Date(uniqueDates[0]);
    firstLogDate.setHours(0, 0, 0, 0);

    // If the latest log is older than yesterday, streak is broken
    if (firstLogDate.getTime() < yesterday.getTime() && firstLogDate.getTime() !== today.getTime()) {
      return 0;
    }

    let count = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = new Date(uniqueDates[i]);
      const prev = new Date(uniqueDates[i + 1]);
      current.setHours(0, 0, 0, 0);
      prev.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(current.getTime() - prev.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        count++;
      } else if (diffDays > 1) {
        break; // streak ended
      }
    }
    return count;
  }, [dailyLogs]);

  // Weight Goal Progress
  const weightProgress = useMemo(() => {
    // If we have weight logs, use the oldest weight log as initial weight, or the current profile weight
    const initialWeight = sortedWeightLogs.length > 0 ? sortedWeightLogs[0].weight : profile.weight;
    const currentWeight = profile.weight;
    const targetWeight = profile.goalWeight;

    const displayUnit = profile.weightUnit;
    const toUnit = (kg: number) => {
      return displayUnit === 'lb' ? Math.round(kg * 2.20462 * 10) / 10 : Math.round(kg * 10) / 10;
    };

    const initial = toUnit(initialWeight);
    const current = toUnit(currentWeight);
    const target = toUnit(targetWeight);

    let pct = 0;
    if (profile.goal === 'maintain') {
      pct = 100; // already there!
    } else {
      const totalDiff = target - initial;
      if (totalDiff === 0) {
        pct = 100;
      } else {
        const currentDiff = current - initial;
        pct = Math.round((currentDiff / totalDiff) * 100);
        pct = Math.min(100, Math.max(0, pct));
      }
    }

    return {
      initial,
      current,
      target,
      pct,
      unit: displayUnit,
    };
  }, [profile, sortedWeightLogs]);

  // Motivational message based on stats
  const motivation = useMemo(() => {
    if (healthScore >= 85) {
      return {
        title: "Outstanding Health Status!",
        text: "You are in an exceptional health bracket. Keep fueling your body with clean hydration and regular movement.",
        emoji: "🌟",
      };
    } else if (healthScore >= 70) {
      return {
        title: "Vibrant & Balanced",
        text: "Your lifestyle choices are paying off nicely. Focus on fine-tuning your sleep duration or daily steps for a final boost.",
        emoji: "⚡",
      };
    } else if (healthScore >= 50) {
      return {
        title: "Steady Progress",
        text: "You are building steady habits. Complete your daily check-in regularly and try to add 1 more glass of water today.",
        emoji: "🌱",
      };
    } else {
      return {
        title: "Nurture Yourself",
        text: "Let's focus on micro-habits. Just logging your metrics is a huge first step. Try a simple 4-7-8 breathing exercise today.",
        emoji: "🧘",
      };
    }
  }, [healthScore]);

  // Helper for rendering mood emoji
  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'sad': return '😢';
      case 'neutral': return '😐';
      case 'happy': return '🙂';
      case 'joy': return '😀';
      case 'excited': return '🔥';
      default: return '😐';
    }
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-900 shadow-xs">
        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-semibold">Medical Disclaimer:</span> VitalTrack provides wellness tips, habits tracking, and lifestyle guidelines based on standard metabolic mathematics. This application is designed solely for healthy lifestyle tracking and does not provide clinical diagnosis, medical treatment, or healthcare prescriptions. Consult a primary physician before beginning any strenuous workout routine or restrictive dietary plan.
        </div>
      </div>

      {/* Top Banner (Welcome & Streaks) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-[#ECFDF5] border border-[#D1FAE5] p-6 rounded-[24px] flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-2 z-10">
            <h2 className="text-xl font-bold text-[#065F46]">Welcome Back, {profile.name || "Healthy Explorer"}!</h2>
            <p className="text-[#065F46]/80 text-xs max-w-md leading-relaxed">
              Your overall Vitality Score is calculated based on sleep, BMI, steps, water intake, and mindfulness. Every healthy choice increases your score.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-2 bg-white w-fit py-1.5 px-4 rounded-full border border-[#D1FAE5] z-10">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-100 animate-pulse" />
            <span className="text-xs font-semibold text-[#065F46]">
              {streak} Day Check-In Streak
            </span>
          </div>
        </div>

        {/* Motivational Card */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-6 flex flex-col justify-between shadow-none relative">
          <div className="flex gap-3">
            <span className="text-2xl shrink-0" role="img" aria-label="motivation">
              {motivation.emoji}
            </span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm leading-tight">{motivation.title}</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {motivation.text}
              </p>
            </div>
          </div>
          <button 
            id="dashboard-cta-btn"
            onClick={() => onNavigate('checkin')}
            className="mt-4 w-full text-center text-xs font-semibold py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition"
          >
            Complete Daily Check-In
          </button>
        </div>
      </div>

      {/* Core Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Health Score Dial */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 flex flex-col items-center justify-between shadow-none">
          <div className="w-full text-center mb-2">
            <h3 className="font-bold text-gray-800 text-lg">Vitality Score</h3>
            <p className="text-xs text-gray-400">Weighted wellness baseline</p>
          </div>

          {/* SVG Circular Meter */}
          <div className="relative w-40 h-40 my-3 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="64"
                className="stroke-gray-100"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="64"
                className="stroke-emerald-500 transition-all duration-1000 ease-out"
                strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 64}`}
                strokeDashoffset={`${2 * Math.PI * 64 * (1 - healthScore / 100)}`}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-4xl font-extrabold text-gray-800">{healthScore}</span>
              <span className="text-xs text-gray-400 block font-medium">/ 100</span>
            </div>
          </div>

          {/* Core breakdown list */}
          <div className="w-full space-y-2.5 mt-2">
            {[
              { label: "Body Composition (BMI)", score: breakdown.bmi, color: "bg-emerald-500" },
              { label: "Restorative Sleep", score: breakdown.sleep, color: "bg-teal-500" },
              { label: "Physical Activity", score: breakdown.activity, color: "bg-sky-500" },
              { label: "Hydration Status", score: breakdown.water, color: "bg-blue-500" },
              { label: "Stress Resilience", score: breakdown.stress, color: "bg-indigo-500" },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-gray-500">
                  <span>{item.label}</span>
                  <span className="font-mono text-gray-700 font-semibold">{item.score}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goal Progress Card */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 flex flex-col justify-between shadow-none">
          <div className="space-y-1">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-1.5">
              <Target className="w-5 h-5 text-emerald-500" />
              Weight Strategy
            </h3>
            <p className="text-xs text-gray-400 capitalize">Goal: {profile.goal} weight</p>
          </div>

          {/* Goal Metrics */}
          <div className="my-6 space-y-4">
            <div className="flex justify-between items-center text-center">
              <div className="space-y-0.5">
                <span className="text-xs text-gray-400 font-medium">Starting</span>
                <p className="text-lg font-bold text-gray-700">{weightProgress.initial} {weightProgress.unit}</p>
              </div>
              <div className="h-8 w-[1px] bg-gray-100" />
              <div className="space-y-0.5 bg-emerald-50/50 py-1 px-3 rounded-xl border border-emerald-100/50">
                <span className="text-xs text-emerald-800 font-semibold">Current</span>
                <p className="text-lg font-extrabold text-emerald-950">{weightProgress.current} {weightProgress.unit}</p>
              </div>
              <div className="h-8 w-[1px] bg-gray-100" />
              <div className="space-y-0.5">
                <span className="text-xs text-gray-400 font-medium">Target</span>
                <p className="text-lg font-bold text-gray-700">{weightProgress.target} {weightProgress.unit}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-gray-500">
                <span>Goal Progress</span>
                <span className="font-mono text-emerald-600">{weightProgress.pct}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-100">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500" 
                  style={{ width: `${weightProgress.pct}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/30 p-3 rounded-2xl border border-emerald-100/40 text-[11px] text-emerald-800 leading-relaxed flex gap-2">
            <Trophy className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
            <div>
              {profile.goal === 'maintain' ? (
                "You are maintaining your weight beautifully. Make sure to update your profile if your weight shifts."
              ) : (
                `You are currently ${weightProgress.pct}% of the way to your target weight of ${weightProgress.target} ${weightProgress.unit}. Consistent exercise and diet make progress sustainable.`
              )}
            </div>
          </div>
        </div>

        {/* Today's Log Card */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 flex flex-col justify-between shadow-none">
          <div className="space-y-1">
            <h3 className="font-bold text-gray-800 text-lg">Today's Logs</h3>
            <p className="text-xs text-gray-400">Snapshot of daily check-in habits</p>
          </div>

          {latestDailyLog ? (
            <div className="my-5 grid grid-cols-2 gap-3.5">
              <div className="p-3 bg-sky-50/30 border border-sky-100/50 rounded-2xl flex items-center gap-3">
                <Footprints className="w-5 h-5 text-sky-500" />
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Steps Taken</span>
                  <span className="text-sm font-bold text-gray-700 font-mono">{latestDailyLog.steps.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/30 border border-blue-100/50 rounded-2xl flex items-center gap-3">
                <Droplets className="w-5 h-5 text-blue-500" />
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Water Hydration</span>
                  <span className="text-sm font-bold text-gray-700 font-mono">{latestDailyLog.waterIntake} glasses</span>
                </div>
              </div>

              <div className="p-3 bg-teal-50/30 border border-teal-100/50 rounded-2xl flex items-center gap-3">
                <BedDouble className="w-5 h-5 text-teal-500" />
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Sleep Hours</span>
                  <span className="text-sm font-bold text-gray-700 font-mono">{latestDailyLog.sleepHours} hrs</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl flex items-center gap-3">
                <span className="text-xl leading-none">{getMoodEmoji(latestDailyLog.mood)}</span>
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Mood Status</span>
                  <span className="text-xs font-bold text-gray-700 capitalize">{latestDailyLog.mood}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="my-6 text-center py-5 space-y-2">
              <p className="text-sm text-gray-400">No logs submitted for today yet.</p>
              <button 
                id="cta-logs-button"
                onClick={() => onNavigate('checkin')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-4"
              >
                Log metrics now
              </button>
            </div>
          )}

          {latestDailyLog?.journalNotes ? (
            <div className="bg-gray-50/60 p-3 rounded-2xl border border-gray-100/80 text-xs text-gray-600 italic line-clamp-2 leading-relaxed flex gap-2">
              <MessageSquareHeart className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              <span>"{latestDailyLog.journalNotes}"</span>
            </div>
          ) : (
            <div className="bg-gray-50/30 p-3 rounded-2xl border border-gray-100/30 text-center text-[11px] text-gray-400 italic">
              "No journal notes logged for today."
            </div>
          )}
        </div>
      </div>

      {/* Weight trend chart */}
      <div className="grid grid-cols-1 gap-6">
        <WeightTrendChart logs={weightLogs} weightUnit={profile.weightUnit} />
      </div>
    </div>
  );
}
