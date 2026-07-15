import React, { useState, useMemo } from 'react';
import { UserProfile, DailyLog } from '../types';
import { calculateBMI, calculateHealthScore, calculateBMR, calculateTDEE, calculateNutritionTargets } from '../utils/calculations';
import { Sparkles, Apple, Layers, CheckCircle2, ChevronRight, Calculator, RefreshCw } from 'lucide-react';

interface ImprovementPlanProps {
  profile: UserProfile;
  dailyLogs: DailyLog[];
}

export default function ImprovementPlan({ profile, dailyLogs }: ImprovementPlanProps) {
  const [activePlanTab, setActivePlanTab] = useState<'basic' | 'intermediate' | 'advanced'>('basic');

  // Math references
  const bmiResult = useMemo(() => calculateBMI(profile.weight, profile.height), [profile.weight, profile.height]);
  const bmr = useMemo(() => calculateBMR(profile), [profile]);
  const tdee = useMemo(() => calculateTDEE(bmr, profile.activityLevel), [bmr, profile.activityLevel]);
  
  const nutritionTargets = useMemo(() => {
    return calculateNutritionTargets(tdee, profile.goal, profile.weight);
  }, [tdee, profile.goal, profile.weight]);

  const { score: healthScore } = useMemo(() => {
    return calculateHealthScore(profile, dailyLogs);
  }, [profile, dailyLogs]);

  // Analyze recent stats to customize messages
  const statsAnalysis = useMemo(() => {
    const recent = dailyLogs.slice(-5);
    const avgSleep = recent.length > 0 ? recent.reduce((sum, l) => sum + l.sleepHours, 0) / recent.length : 7.5;
    const avgWater = recent.length > 0 ? recent.reduce((sum, l) => sum + l.waterIntake, 0) / recent.length : 5;
    const avgSteps = recent.length > 0 ? recent.reduce((sum, l) => sum + l.steps, 0) / recent.length : 6000;
    const avgStress = recent.length > 0 ? recent.reduce((sum, l) => sum + l.stressLevel, 0) / recent.length : 2.5;

    return {
      needsSleep: avgSleep < 7.0,
      needsWater: avgWater < 7,
      needsActivity: avgSteps < 7000,
      highStress: avgStress > 3.0,
    };
  }, [dailyLogs]);

  // Generate dynamic habits based on current state
  const plans = useMemo(() => {
    // 1. BASIC HABITS
    const basicList = [
      "Increase Hydration: Drink 1 large glass of water immediately upon waking to trigger digestive enzymes.",
      "15-Minute Movement: Complete a brisk 15-minute walk today, ideally in morning sunlight to lock in melatonin timings.",
      "Spinal Resets: Complete a 4-7-8 breathing set (3 full rounds) to down-regulate nervous system stress.",
      "Posture Alignment: Maintain your computer monitor at eye level to prevent spinal slouching."
    ];
    if (statsAnalysis.needsSleep) {
      basicList.unshift("Circadian Lock: Sleep and wake up at the exact same hour daily (even on weekends).");
    }
    if (statsAnalysis.needsWater) {
      basicList.push("Water Benchmarks: Keep a 1L water bottle at your workspace and finish it by 1:00 PM.");
    }
    if (bmiResult.category === 'Overweight' || bmiResult.category === 'Obese') {
      basicList.push("Liquid Calorie Audit: Eliminate sodas, store-bought juices, and sugary coffees in favor of unsweetened tea or water.");
    }

    // 2. INTERMEDIATE STRATEGIES
    const intermediateList = [
      "Protein Packing: Base every meal around a high-quality protein block (aim for 25-35g per meal).",
      "Goal-Specific Exercise: Schedule three 30-to-45 minute workout sessions this week (strength or high-intensity cardio).",
      "Meal Timing Windows: Allow a clear 12-hour digestive rest window overnight (e.g. fast from 8:00 PM to 8:00 AM).",
      "Posture Stretch: Perform a door-frame pectoral stretch and wall-stands daily to restore thoracic extension."
    ];
    if (profile.goal === 'lose') {
      intermediateList.unshift("Calorie Deficit Window: Structure a mild 300-500 calorie deficit daily from your calculated TDEE.");
      intermediateList.push("Portion Management: Use smaller plates (9-inch) to psychologically curb portion volumes.");
    } else if (profile.goal === 'gain') {
      intermediateList.unshift("Caloric Surplus Structure: Consume 300-400 clean surplus calories above TDEE, focusing on complex carbohydrates.");
      intermediateList.push("Hypertrophy Framework: Complete 3 weekly resistance workouts, centering progressive weight increases.");
    }

    // 3. ADVANCED PROTOCOLS
    const advancedList = [
      "Macronutrient Targeting: Adhere to strict macro partitions: " + 
      `${nutritionTargets.protein}g Protein | ${nutritionTargets.carbs}g Carbs | ${nutritionTargets.fats}g Fats.`,
      "Strength Splits: Implement a 4-day workout split (Push/Pull/Legs or Upper/Lower) with tracked progression.",
      "Adenosine Management: Stop all caffeine intake exactly 10 hours before your scheduled sleep hour.",
      "Cortisol Mitigation: Meditate for 10 minutes or journal gratitude before evening screen use.",
      "Cardiovascular VO2: Add one weekly session of Zone 2 steady-state cardio (maintained at 60-70% max heart rate) for mitochondrial health."
    ];
    if (statsAnalysis.highStress) {
      advancedList.unshift("Adrenal Balance: Eliminate caffeine on empty stomach. Supplement with ashwagandha or L-theanine after primary consultation.");
    }

    return {
      basic: basicList,
      intermediate: intermediateList,
      advanced: advancedList,
    };
  }, [statsAnalysis, bmiResult, profile.goal, nutritionTargets]);

  // Nutrition tips categorized by goal
  const nutritionTips = useMemo(() => {
    switch (profile.goal) {
      case 'lose':
        return [
          "Volumize: Center your meals on high-volume, low-calorie foods (leafy greens, cucumbers, broccoli) to feel full.",
          "Protein-First: Eat your protein source first; it triggers satiety signals in the brain faster than fats or carbs.",
          "Mindful Fats: Healthy oils, avocados, and nuts are nutrient-dense but calorie-heavy. Measure them precisely.",
          "Hydration Buffering: Drink a large glass of water 15 minutes before major meals to curb excess hunger cravings."
        ];
      case 'gain':
        return [
          "Nutrient Density: Incorporate calorie-dense, healthy foods (avocados, nuts, seeds, nut butters, olive oil) to hit surplus goals.",
          "Liquid Nutrition: Add clean protein shakes with oats, bananas, and peanut butter if you struggle to eat enough volume.",
          "Complex Carbs: Fuel heavy lifting with sweet potatoes, brown rice, and oats for sustained glycogen synthesis.",
          "Meal Frequency: Eat 4 to 5 medium-sized meals rather than 2 massive meals to optimize digestion and protein absorption."
        ];
      case 'maintain':
      default:
        return [
          "Metabolic Balance: Match calories consumed to your calculated TDEE, focusing on clean whole food sourcing.",
          "Flexible Dieting: Follow the 80/20 rule: 80% nutrient-dense whole foods, 20% flexible treats to ensure long-term consistency.",
          "Fiber Thresholds: Aim for 25-35 grams of dietary fiber daily to maintain gut microbiome health.",
          "Mineral Sourcing: Eat a rainbow of vegetables to source critical micro-nutrients, zinc, and magnesium."
        ];
    }
  }, [profile.goal]);

  return (
    <div className="space-y-6">
      
      {/* Dynamic Recommendations Engine */}
      <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-none space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-1.5">
              <Sparkles className="w-5.5 h-5.5 text-emerald-500 animate-pulse" />
              Tailored Improvement Plan
            </h3>
            <p className="text-xs text-gray-400">
              Custom suggestions updated dynamically based on your BMI ({bmiResult.category}), Health Score ({healthScore}), and recent logs.
            </p>
          </div>

          {/* Tab buttons */}
          <div className="inline-flex bg-gray-100 p-1 rounded-2xl text-xs font-bold gap-1">
            {[
              { id: 'basic', label: 'Basic Habits' },
              { id: 'intermediate', label: 'Intermediate' },
              { id: 'advanced', label: 'Advanced Protocols' },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`plan-tab-${tab.id}-btn`}
                onClick={() => setActivePlanTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl transition ${activePlanTab === tab.id ? 'bg-emerald-500 text-white shadow-xs' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Habit items list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans[activePlanTab].map((item, index) => (
            <div 
              key={index} 
              className="p-4 rounded-2xl border border-emerald-100/50 bg-emerald-50/10 hover:bg-emerald-50/20 transition flex gap-3 items-start"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Calorie and Macronutrient Targets Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calorie Macro Dashboard (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-200 p-6 space-y-6 shadow-none flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-500" />
              Nutrition & Caloric Targets
            </h3>
            <p className="text-xs text-gray-400">
              Recommended macro-nutritional balances configured for your target goal of <span className="font-semibold text-emerald-700 capitalize">{profile.goal} weight</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2">
            
            {/* Calories */}
            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl text-center flex flex-col justify-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">Target Calories</span>
              <p className="text-2xl font-black text-emerald-950 font-mono">
                {nutritionTargets.calories}
              </p>
              <span className="text-[9px] text-gray-400 mt-1 block">kcal / day</span>
            </div>

            {/* Protein */}
            <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-2xl text-center flex flex-col justify-center">
              <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block mb-1">Protein</span>
              <p className="text-2xl font-black text-sky-950 font-mono">
                {nutritionTargets.protein}g
              </p>
              <span className="text-[9px] text-gray-400 mt-1 block">({nutritionTargets.protein * 4} kcal)</span>
            </div>

            {/* Carbs */}
            <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl text-center flex flex-col justify-center">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">Carbs</span>
              <p className="text-2xl font-black text-amber-950 font-mono">
                {nutritionTargets.carbs}g
              </p>
              <span className="text-[9px] text-gray-400 mt-1 block">({nutritionTargets.carbs * 4} kcal)</span>
            </div>

            {/* Fats */}
            <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-2xl text-center flex flex-col justify-center">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block mb-1">Fats</span>
              <p className="text-2xl font-black text-rose-950 font-mono">
                {nutritionTargets.fats}g
              </p>
              <span className="text-[9px] text-gray-400 mt-1 block">({nutritionTargets.fats * 9} kcal)</span>
            </div>
          </div>

          {/* Bar partition ratio */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-500 block">Macronutrient Calorie Ratio</span>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex font-mono text-[9px] font-bold text-white text-center">
              <div 
                className="h-full bg-sky-500 flex items-center justify-center" 
                style={{ width: `${Math.round(((nutritionTargets.protein * 4) / nutritionTargets.calories) * 100)}%` }}
              >
                Prot
              </div>
              <div 
                className="h-full bg-amber-500 flex items-center justify-center" 
                style={{ width: `${Math.round(((nutritionTargets.carbs * 4) / nutritionTargets.calories) * 100)}%` }}
              >
                Carb
              </div>
              <div 
                className="h-full bg-rose-500 flex items-center justify-center" 
                style={{ width: `${Math.round(((nutritionTargets.fats * 9) / nutritionTargets.calories) * 100)}%` }}
              >
                Fat
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
              <span>Protein: 4 kcal/g</span>
              <span>Carbohydrates: 4 kcal/g</span>
              <span>Fats: 9 kcal/g</span>
            </div>
          </div>
        </div>

        {/* Healthy Eating Tips Card (1 col) */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-4 shadow-none">
          <div className="space-y-0.5">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-1.5">
              <Apple className="w-5 h-5 text-emerald-500" />
              Nutritional Guidance
            </h3>
            <p className="text-xs text-gray-400 capitalize">Healthy guidelines for: {profile.goal} weight</p>
          </div>

          <div className="space-y-3">
            {nutritionTips.map((tip, idx) => (
              <div key={idx} className="flex gap-2.5 items-start">
                <ChevronRight className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
