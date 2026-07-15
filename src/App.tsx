import { useState, useEffect, useMemo } from 'react';
import { UserProfile, DailyLog, WeightLog, WorkoutLog, OuterHealthAssessment, ActiveTab } from './types';
import Dashboard from './components/Dashboard';
import BodyMetrics from './components/BodyMetrics';
import DailyCheckIn from './components/DailyCheckIn';
import InnerHealth from './components/InnerHealth';
import OuterHealth from './components/OuterHealth';
import ImprovementPlan from './components/ImprovementPlan';
import HistoryLogs from './components/HistoryLogs';

import { 
  HeartPulse, 
  LayoutDashboard, 
  Scale, 
  Sparkles, 
  Wind, 
  Dumbbell, 
  Compass, 
  History, 
  Menu, 
  X,
  Flame
} from 'lucide-react';

const getRelativeDateStr = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // 1. Initialize User Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('vt_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: 'Jane Doe',
      age: 26,
      gender: 'female',
      height: 168,
      heightUnit: 'cm',
      weight: 64.0,
      weightUnit: 'kg',
      activityLevel: 'moderate',
      goal: 'lose',
      goalWeight: 60.0,
      waist: 72,
      hip: 90,
      chest: 88,
    };
  });

  // 2. Initialize Daily Logs (Seed with relative data if empty)
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('vt_daily_logs');
    if (saved) return JSON.parse(saved);
    return [
      {
        date: getRelativeDateStr(3),
        sleepHours: 8.0,
        sleepQuality: 'good',
        waterIntake: 8,
        steps: 9500,
        exerciseMins: 35,
        mood: 'joy',
        stressLevel: 1,
        journalNotes: 'Woke up early and hydrated immediately. Completed a brisk jog. Feeling exceptionally clear and balanced!',
      },
      {
        date: getRelativeDateStr(2),
        sleepHours: 6.5,
        sleepQuality: 'average',
        waterIntake: 5,
        steps: 6200,
        exerciseMins: 15,
        mood: 'neutral',
        stressLevel: 3,
        journalNotes: 'Slightly drowsy in the afternoon. Need to limit screen time before going to sleep.',
      },
      {
        date: getRelativeDateStr(1),
        sleepHours: 7.5,
        sleepQuality: 'good',
        waterIntake: 7,
        steps: 8400,
        exerciseMins: 25,
        mood: 'happy',
        stressLevel: 2,
        journalNotes: 'Had a wonderful and productive day. Completed core resistance and finished off with box breathing exercises.',
      },
    ];
  });

  // 3. Initialize Weight Logs (Seed with trend progression if empty)
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(() => {
    const saved = localStorage.getItem('vt_weight_logs');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'w1', date: getRelativeDateStr(6), weight: 64.8 },
      { id: 'w2', date: getRelativeDateStr(4), weight: 64.5 },
      { id: 'w3', date: getRelativeDateStr(2), weight: 64.2 },
      { id: 'w4', date: getRelativeDateStr(0), weight: 64.0 },
    ];
  });

  // 4. Initialize Workout Logs
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(() => {
    const saved = localStorage.getItem('vt_workout_logs');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'ex1', date: getRelativeDateStr(4), type: 'Strength', duration: 45, intensity: 'high' },
      { id: 'ex2', date: getRelativeDateStr(2), type: 'Cardio', duration: 25, intensity: 'moderate' },
    ];
  });

  // 5. Initialize Assessments
  const [assessments, setAssessments] = useState<OuterHealthAssessment[]>(() => {
    const saved = localStorage.getItem('vt_assessments');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'a1', date: getRelativeDateStr(2), skinRating: 3, hairRating: 4, postureRating: 4 },
    ];
  });

  // --- LocalStorage persistence hooks ---
  useEffect(() => {
    localStorage.setItem('vt_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('vt_daily_logs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem('vt_weight_logs', JSON.stringify(weightLogs));
  }, [weightLogs]);

  useEffect(() => {
    localStorage.setItem('vt_workout_logs', JSON.stringify(workoutLogs));
  }, [workoutLogs]);

  useEffect(() => {
    localStorage.setItem('vt_assessments', JSON.stringify(assessments));
  }, [assessments]);

  // --- Core Mutation Actions ---
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updated }));
  };

  const handleSaveDailyLog = (log: DailyLog) => {
    setDailyLogs(prev => {
      const idx = prev.findIndex(item => item.date === log.date);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = log;
        return updated;
      } else {
        return [...prev, log];
      }
    });
  };

  const handleDeleteDailyLog = (date: string) => {
    if (window.confirm(`Delete check-in log entry for ${date}?`)) {
      setDailyLogs(prev => prev.filter(log => log.date !== date));
    }
  };

  const handleAddWeightLog = (weight: number, date: string) => {
    const id = `w-${Date.now()}`;
    setWeightLogs(prev => {
      const filtered = prev.filter(log => log.date !== date); // unique date entry
      return [...filtered, { id, date, weight }].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
  };

  const handleAddWorkout = (workout: Omit<WorkoutLog, 'id'>) => {
    const newLog: WorkoutLog = {
      ...workout,
      id: `ex-${Date.now()}`
    };
    setWorkoutLogs(prev => [...prev, newLog]);
  };

  const handleDeleteWorkout = (id: string) => {
    setWorkoutLogs(prev => prev.filter(item => item.id !== id));
  };

  const handleAddAssessment = (assessment: Omit<OuterHealthAssessment, 'id'>) => {
    const newAssessment: OuterHealthAssessment = {
      ...assessment,
      id: `a-${Date.now()}`
    };
    setAssessments(prev => {
      const filtered = prev.filter(a => a.date !== assessment.date); // single daily assessment
      return [...filtered, newAssessment];
    });
  };

  const handleImportBackup = (data: {
    profile: UserProfile;
    dailyLogs: DailyLog[];
    weightLogs: WeightLog[];
    workoutLogs: WorkoutLog[];
    assessments: OuterHealthAssessment[];
  }) => {
    setProfile(data.profile);
    setDailyLogs(data.dailyLogs);
    setWeightLogs(data.weightLogs);
    setWorkoutLogs(data.workoutLogs);
    setAssessments(data.assessments);
  };

  const handleResetAllData = () => {
    localStorage.clear();
    // Reset back to initial configurations
    setProfile({
      name: '',
      age: 25,
      gender: 'other',
      height: 165,
      heightUnit: 'cm',
      weight: 60.0,
      weightUnit: 'kg',
      activityLevel: 'moderate',
      goal: 'maintain',
      goalWeight: 60.0,
    });
    setDailyLogs([]);
    setWeightLogs([]);
    setWorkoutLogs([]);
    setAssessments([]);
    setActiveTab('metrics'); // Redirect to configure profile
  };

  // --- Dynamic calculations for high level overview ---
  const streak = useMemo(() => {
    if (dailyLogs.length === 0) return 0;
    
    // Sort log dates ascending and filter unique
    const uniqueDates = (Array.from(new Set(dailyLogs.map(log => log.date))) as string[])
      .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime()); // descending order

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

  const headerStats = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const loggedToday = dailyLogs.some(log => log.date === todayStr);

    return {
      loggedToday,
      name: profile.name || "Explorer",
    };
  }, [dailyLogs, profile.name]);

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'metrics', label: 'Body Metrics', icon: Scale },
    { id: 'checkin', label: 'Daily Check-in', icon: Sparkles },
    { id: 'inner', label: 'Inner Health', icon: Wind },
    { id: 'outer', label: 'Outer Health', icon: Dumbbell },
    { id: 'plan', label: 'Improvement Plan', icon: Compass },
    { id: 'history', label: 'Data History', icon: History },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased font-sans">
      
      {/* Mobile Top Header Bar */}
      <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-emerald-500" />
          <span className="font-extrabold text-lg text-gray-800 tracking-tight font-display">VitalTrack</span>
        </div>
        <button 
          id="mobile-hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1 text-gray-500 hover:text-gray-800 focus:outline-none"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Side Navigation Panel */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
        w-60 bg-white border-r border-slate-200 flex flex-col justify-between z-40 shadow-none
        h-full sticky top-0
      `}>
        <div className="p-6 space-y-8">
          {/* Logo */}
          <div className="hidden md:flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-emerald-500 stroke-[3]" />
            <span className="font-bold text-xl text-emerald-500 tracking-tight font-display">VitalTrack</span>
          </div>

          {/* Nav Items Link List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-slate-100 text-emerald-500' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Streak Block */}
        <div className="p-6 border-t border-slate-100 bg-white">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400">Current Streak</p>
            <p className="text-base font-bold text-slate-850 flex items-center gap-1.5 mt-0.5">
              {streak} {streak === 1 ? 'Day' : 'Days'} <span>🔥</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Sidebar Overlay Backdrop on Mobile */}
      {isMobileMenuOpen && (
        <div 
          id="sidebar-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* Main Panel Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 sticky top-0 z-20">
          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Clinical Wellness</span>
            <h1 className="text-xl font-bold text-gray-800 capitalize">{activeTab.replace('checkin', 'Daily Check-in').replace('plan', 'Improvement Plan').replace('inner', 'Inner Health').replace('outer', 'Outer Health')} Overview</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-bold text-gray-700 block">Hello, {headerStats.name}</span>
              <span className="text-[9px] text-gray-400 block font-semibold font-mono">
                {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            
            {headerStats.loggedToday ? (
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-emerald-100" /> Logged Today
              </span>
            ) : (
              <button 
                id="header-checkin-btn"
                onClick={() => setActiveTab('checkin')}
                className="text-[10px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-full transition shadow-xs"
              >
                + Check-In Today
              </button>
            )}
          </div>
        </header>

        {/* Content Box */}
        <div className="flex-1 p-4 md:p-8 space-y-6">
          {activeTab === 'dashboard' && (
            <Dashboard 
              profile={profile} 
              dailyLogs={dailyLogs} 
              weightLogs={weightLogs} 
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
            />
          )}

          {activeTab === 'metrics' && (
            <BodyMetrics 
              profile={profile} 
              onUpdateProfile={handleUpdateProfile} 
              onAddWeightLog={handleAddWeightLog}
            />
          )}

          {activeTab === 'checkin' && (
            <DailyCheckIn 
              logs={dailyLogs} 
              onSaveLog={handleSaveDailyLog} 
            />
          )}

          {activeTab === 'inner' && (
            <InnerHealth 
              logs={dailyLogs} 
              onSaveLog={handleSaveDailyLog} 
            />
          )}

          {activeTab === 'outer' && (
            <OuterHealth 
              workoutLogs={workoutLogs} 
              assessments={assessments} 
              onAddWorkout={handleAddWorkout} 
              onDeleteWorkout={handleDeleteWorkout} 
              onAddAssessment={handleAddAssessment} 
            />
          )}

          {activeTab === 'plan' && (
            <ImprovementPlan 
              profile={profile} 
              dailyLogs={dailyLogs} 
            />
          )}

          {activeTab === 'history' && (
            <HistoryLogs 
              profile={profile} 
              dailyLogs={dailyLogs} 
              weightLogs={weightLogs} 
              workoutLogs={workoutLogs} 
              assessments={assessments} 
              onDeleteDailyLog={handleDeleteDailyLog}
              onImportData={handleImportBackup}
              onResetAllData={handleResetAllData}
            />
          )}
        </div>
      </main>

    </div>
  );
}
