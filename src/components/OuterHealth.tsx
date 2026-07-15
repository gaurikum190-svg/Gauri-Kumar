import React, { useState, useMemo } from 'react';
import { WorkoutLog, OuterHealthAssessment } from '../types';
import { Dumbbell, Sparkles, Smile, ShieldAlert, BookOpen, Trash2, Calendar, ClipboardCheck } from 'lucide-react';

interface OuterHealthProps {
  workoutLogs: WorkoutLog[];
  assessments: OuterHealthAssessment[];
  onAddWorkout: (workout: Omit<WorkoutLog, 'id'>) => void;
  onDeleteWorkout: (id: string) => void;
  onAddAssessment: (assessment: Omit<OuterHealthAssessment, 'id'>) => void;
}

export default function OuterHealth({ 
  workoutLogs, 
  assessments, 
  onAddWorkout, 
  onDeleteWorkout, 
  onAddAssessment 
}: OuterHealthProps) {
  
  // 1. Workout form states
  const [workoutType, setWorkoutType] = useState<string>('Cardio');
  const [workoutDuration, setWorkoutDuration] = useState<number>(30);
  const [workoutIntensity, setWorkoutIntensity] = useState<WorkoutLog['intensity']>('moderate');
  const [workoutDate, setWorkoutDate] = useState<string>(
    new Date().toLocaleDateString('en-CA')
  );

  // 2. Assessment states (Sliders 1 to 5)
  const [skinRating, setSkinRating] = useState<number>(3);
  const [hairRating, setHairRating] = useState<number>(3);
  const [postureRating, setPostureRating] = useState<number>(3);

  const [assessmentSuccess, setAssessmentSuccess] = useState<boolean>(false);

  // Sort workouts
  const sortedWorkouts = useMemo(() => {
    return [...workoutLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [workoutLogs]);

  // Handle assessment submit
  const handleAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAssessment({
      date: new Date().toLocaleDateString('en-CA'),
      skinRating,
      hairRating,
      postureRating,
    });
    setAssessmentSuccess(true);
    setTimeout(() => setAssessmentSuccess(false), 3000);
  };

  // Handle workout submit
  const handleWorkoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddWorkout({
      date: workoutDate,
      type: workoutType,
      duration: workoutDuration,
      intensity: workoutIntensity,
    });
    // reset form with sensible presets
    setWorkoutDuration(30);
  };

  // Static tips database
  const physicalTips = [
    {
      title: "Posture & Spine Alignment",
      tips: [
        "The 90-Degree Rule: Adjust your workstation chair so your elbows, hips, and knees remain bent at exactly 90 degrees.",
        "Sternum Raising: Raise your breastbone slightly when sitting. This automatically pulls the shoulder blades back and down.",
        "Stand-up Breaks: For every 45 minutes of desk posture, perform 2 minutes of spinal extension stretches or chest openers.",
      ]
    },
    {
      title: "Healthy Skin & Scalp Care",
      tips: [
        "UV Protection: Daily SPF 30+ blocks premature collagen destruction even on cloudy or indoor days.",
        "Double Cleansing: Use an oil-based cleanser followed by water-based gel to dissolve sweat and environmental pollutants.",
        "Circulatory Stimulation: Massage your scalp for 3 minutes daily to improve nutrient delivery to hair roots.",
      ]
    },
    {
      title: "Workout Structuring Guidelines",
      tips: [
        "Cardio vs. Strength: Merge both. Cardiovascular work strengthens ventricles while resistance training preserves lean mass.",
        "Progressive Overload: Gradually increase physical resistance or volume weekly to spark muscular and skeletal adaptation.",
        "Recovery Adaptation: Muscles do not grow during workout stress; they rebuild during deep sleep. Respect your recovery hours.",
      ]
    }
  ];

  const latestAssessment = useMemo(() => {
    if (assessments.length === 0) return null;
    const sorted = [...assessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0];
  }, [assessments]);

  return (
    <div className="space-y-6">
      
      {/* Self Assessment and Workout Logger (Two-column layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Physical self-assessment sliders */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-5 shadow-none flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-1.5">
              <ClipboardCheck className="w-5.5 h-5.5 text-emerald-500" />
              Outer Health Self-Assessment
            </h3>
            <p className="text-xs text-gray-400">Regular self-checks help flag postural imbalances or dehydration symptoms early.</p>
          </div>

          <form onSubmit={handleAssessmentSubmit} className="space-y-4 my-2">
            
            {/* Skin */}
            <div className="space-y-1 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
              <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                <span>Skin Quality Rating</span>
                <span className="font-mono text-emerald-600 font-extrabold">{skinRating} / 5</span>
              </div>
              <input 
                id="skin-slider"
                type="range" 
                min="1" 
                max="5" 
                value={skinRating}
                onChange={(e) => setSkinRating(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-gray-100 rounded-lg appearance-none"
              />
              <span className="text-[10px] text-gray-400 block font-medium leading-normal">
                (1: Dehydrated/Irritated, 3: Balanced/Normal, 5: Hydrated/Flawless)
              </span>
            </div>

            {/* Hair */}
            <div className="space-y-1 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
              <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                <span>Hair & Scalp Health</span>
                <span className="font-mono text-emerald-600 font-extrabold">{hairRating} / 5</span>
              </div>
              <input 
                id="hair-slider"
                type="range" 
                min="1" 
                max="5" 
                value={hairRating}
                onChange={(e) => setHairRating(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-gray-100 rounded-lg appearance-none"
              />
              <span className="text-[10px] text-gray-400 block font-medium leading-normal">
                (1: Dry/Thin/Dandruff, 3: Healthy/Normal, 5: Thick/Lustrous)
              </span>
            </div>

            {/* Posture */}
            <div className="space-y-1 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
              <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                <span>Spinal Alignment & Posture</span>
                <span className="font-mono text-emerald-600 font-extrabold">{postureRating} / 5</span>
              </div>
              <input 
                id="posture-slider"
                type="range" 
                min="1" 
                max="5" 
                value={postureRating}
                onChange={(e) => setPostureRating(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-gray-100 rounded-lg appearance-none"
              />
              <span className="text-[10px] text-gray-400 block font-medium leading-normal">
                (1: Slouched/Neck pain, 3: Normal/Mild Stiffness, 5: Upright/Symmetric)
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] text-emerald-700 font-semibold">
                {assessmentSuccess ? "✓ Self-assessment saved!" : latestAssessment ? `Latest self-check on: ${latestAssessment.date}` : ""}
              </span>
              <button
                id="save-assessment-btn"
                type="submit"
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition shadow-md"
              >
                Log Assessment
              </button>
            </div>
          </form>
        </div>

        {/* Workout Logger form */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-4 shadow-none">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-1.5">
              <Dumbbell className="w-5.5 h-5.5 text-emerald-500" />
              Physical Workout Logger
            </h3>
            <p className="text-xs text-gray-400">Keep track of physical exercises, workout length, and metabolic load.</p>
          </div>

          <form onSubmit={handleWorkoutSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500" htmlFor="workout-type">Exercise Modality</label>
                <select 
                  id="workout-type"
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition bg-white"
                >
                  <option value="Cardio">Cardio / Running</option>
                  <option value="Strength">Strength / Weights</option>
                  <option value="HIIT">HIIT / Circuits</option>
                  <option value="Yoga">Yoga / Pilates</option>
                  <option value="Cycling">Cycling / Spinning</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Walking">Walking / Hiking</option>
                  <option value="Other">Other Modality</option>
                </select>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500" htmlFor="workout-date">Workout Date</label>
                <input 
                  id="workout-date"
                  type="date" 
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  max={new Date().toLocaleDateString('en-CA')}
                />
              </div>

              {/* Duration */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500" htmlFor="workout-duration">Duration (Minutes)</label>
                <input 
                  id="workout-duration"
                  type="number" 
                  value={workoutDuration}
                  onChange={(e) => setWorkoutDuration(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-mono font-bold"
                  min="1"
                  max="480"
                />
              </div>

              {/* Intensity */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500" htmlFor="workout-intensity">Workout Intensity</label>
                <select 
                  id="workout-intensity"
                  value={workoutIntensity}
                  onChange={(e) => setWorkoutIntensity(e.target.value as any)}
                  className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition bg-white"
                >
                  <option value="low">Low Intensity (Conversational)</option>
                  <option value="moderate">Moderate (Breathing heavily)</option>
                  <option value="high">High Intensity (Peak heart rate)</option>
                </select>
              </div>
            </div>

            <button
              id="add-workout-btn"
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition shadow-md"
            >
              Log New Workout Session
            </button>
          </form>
        </div>
      </div>

      {/* Logged Workouts Feed */}
      <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-none">
        <h4 className="font-bold text-gray-800 text-base mb-3">Workout Logs Registry</h4>
        <div className="overflow-x-auto">
          {sortedWorkouts.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Modality</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Intensity</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {sortedWorkouts.map((workout) => (
                  <tr key={workout.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 px-3 font-semibold font-mono text-gray-600">
                      {new Date(workout.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-gray-800 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full text-[10px]">
                        {workout.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-gray-700">
                      {workout.duration} mins
                    </td>
                    <td className="py-3 px-3">
                      <span className={`capitalize font-bold text-[10px] px-2 py-0.5 rounded-full border ${
                        workout.intensity === 'high' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                        workout.intensity === 'moderate' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                        'bg-sky-50 border-sky-100 text-sky-700'
                      }`}>
                        {workout.intensity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        id={`delete-workout-${workout.id}-btn`}
                        onClick={() => onDeleteWorkout(workout.id)}
                        className="p-1.5 bg-gray-50 hover:bg-rose-50 hover:text-rose-600 border border-gray-100 hover:border-rose-100 text-gray-400 rounded-lg transition"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-400 text-xs">
              No workout logs recorded yet. Use the form above to log physical exercise.
            </div>
          )}
        </div>
      </div>

      {/* Clinical Outer Health Tips Grid */}
      <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-none space-y-4">
        <div className="space-y-1">
          <h4 className="font-bold text-gray-800 text-base flex items-center gap-1.5">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            Physical Vitality & Ergonomics Catalog
          </h4>
          <p className="text-xs text-gray-400">Ergonomic spine posture adjustments, skincare, and exercise structures.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {physicalTips.map((category, idx) => (
            <div key={idx} className="bg-gray-50/40 p-4 rounded-2xl border border-gray-100 space-y-3">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">{category.title}</span>
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
