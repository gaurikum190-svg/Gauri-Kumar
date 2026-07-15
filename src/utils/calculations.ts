import { UserProfile, DailyLog } from '../types';

// Convert weight: kg <-> lb
export function kgToLb(kg: number): number {
  return kg * 2.20462;
}

export function lbToKg(lb: number): number {
  return lb / 2.20462;
}

// Convert height: cm <-> ft/in
export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function ftInToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

// BMI Calculation
export function calculateBMI(weightKg: number, heightCm: number): {
  score: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  color: string;
} {
  const heightM = heightCm / 100;
  if (heightM <= 0) return { score: 0, category: 'Normal', color: 'text-gray-500' };
  
  const score = weightKg / (heightM * heightM);
  
  let category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese' = 'Normal';
  let color = 'text-emerald-500 bg-emerald-50 border-emerald-200';

  if (score < 18.5) {
    category = 'Underweight';
    color = 'text-amber-500 bg-amber-50 border-amber-200';
  } else if (score < 25) {
    category = 'Normal';
    color = 'text-emerald-500 bg-emerald-50 border-emerald-200';
  } else if (score < 30) {
    category = 'Overweight';
    color = 'text-orange-500 bg-orange-50 border-orange-200';
  } else {
    category = 'Obese';
    color = 'text-rose-500 bg-rose-50 border-rose-200';
  }

  return { score: Math.round(score * 10) / 10, category, color };
}

// BMR (Mifflin-St Jeor)
export function calculateBMR(profile: UserProfile): number {
  const { weight, height, age, gender } = profile;
  
  // Mifflin-St Jeor Formula
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr -= 78; // average offset
  }
  
  return Math.round(bmr);
}

// TDEE (Total Daily Energy Expenditure)
export function calculateTDEE(bmr: number, activityLevel: UserProfile['activityLevel']): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  
  return Math.round(bmr * multipliers[activityLevel]);
}

// Ideal Weight Range (BMI 18.5 - 24.9)
export function calculateIdealWeightRange(heightCm: number): { min: number; max: number } {
  const heightM = heightCm / 100;
  const min = 18.5 * (heightM * heightM);
  const max = 24.9 * (heightM * heightM);
  return {
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
  };
}

// Waist-to-Hip Ratio WHR
export function calculateWHR(waist?: number, hip?: number, gender?: 'male' | 'female' | 'other'): {
  ratio: number;
  risk: 'Low' | 'Moderate' | 'High' | 'N/A';
  color: string;
} {
  if (!waist || !hip || hip === 0) {
    return { ratio: 0, risk: 'N/A', color: 'text-gray-400' };
  }
  const ratio = waist / hip;
  const roundedRatio = Math.round(ratio * 100) / 100;
  
  let risk: 'Low' | 'Moderate' | 'High' = 'Low';
  let color = 'text-emerald-500';

  const g = gender || 'other';

  if (g === 'male') {
    if (roundedRatio < 0.90) {
      risk = 'Low';
      color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    } else if (roundedRatio <= 0.95) {
      risk = 'Moderate';
      color = 'text-orange-600 bg-orange-50 border-orange-200';
    } else {
      risk = 'High';
      color = 'text-rose-600 bg-rose-50 border-rose-200';
    }
  } else if (g === 'female') {
    if (roundedRatio < 0.80) {
      risk = 'Low';
      color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    } else if (roundedRatio <= 0.85) {
      risk = 'Moderate';
      color = 'text-orange-600 bg-orange-50 border-orange-200';
    } else {
      risk = 'High';
      color = 'text-rose-600 bg-rose-50 border-rose-200';
    }
  } else {
    // Other gender, average standards
    if (roundedRatio < 0.85) {
      risk = 'Low';
      color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    } else if (roundedRatio <= 0.90) {
      risk = 'Moderate';
      color = 'text-orange-600 bg-orange-50 border-orange-200';
    } else {
      risk = 'High';
      color = 'text-rose-600 bg-rose-50 border-rose-200';
    }
  }

  return { ratio: roundedRatio, risk, color };
}

// Nutrition macro-nutrients calculator
export interface NutritionPlan {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
}

export function calculateNutritionTargets(tdee: number, goal: UserProfile['goal'], weightKg: number): NutritionPlan {
  let targetCalories = tdee;
  
  if (goal === 'lose') {
    targetCalories = Math.max(1200, tdee - 500); // 500 calorie deficit, floors at 1200
  } else if (goal === 'gain') {
    targetCalories = tdee + 400; // 400 calorie surplus
  }

  // Protein target: ~2g per kg of bodyweight for active/weight goal, ~1.6g for standard, bounded safely
  let proteinPerKg = 1.6;
  if (goal === 'lose') proteinPerKg = 2.0; // Higher protein to preserve lean mass during deficit
  if (goal === 'gain') proteinPerKg = 1.8; // High protein for muscle mass gains

  let proteinGrams = Math.round(weightKg * proteinPerKg);
  proteinGrams = Math.max(50, Math.min(220, proteinGrams)); // Bound safely

  // Fats target: ~25% of target calories
  const fatCalories = targetCalories * 0.25;
  const fatGrams = Math.round(fatCalories / 9);

  // Carbs target: Remaining calories
  const remainingCalories = targetCalories - (proteinGrams * 4) - (fatGrams * 9);
  const carbGrams = Math.max(50, Math.round(remainingCalories / 4));

  return {
    calories: Math.round(targetCalories),
    protein: proteinGrams,
    carbs: carbGrams,
    fats: fatGrams,
  };
}

// Health Score Calculator
export function calculateHealthScore(profile: UserProfile, logs: DailyLog[]): {
  score: number;
  breakdown: {
    bmi: number;
    sleep: number;
    activity: number;
    water: number;
    stress: number;
  };
} {
  // BMI Component (30%)
  const { score: bmi } = calculateBMI(profile.weight, profile.height);
  let bmiScore = 50;
  if (bmi >= 18.5 && bmi < 25) {
    bmiScore = 100;
  } else if ((bmi >= 17 && bmi < 18.5) || (bmi >= 25 && bmi < 30)) {
    bmiScore = 80;
  } else if ((bmi >= 16 && bmi < 17) || (bmi >= 30 && bmi < 35)) {
    bmiScore = 60;
  } else {
    bmiScore = 40;
  }

  // Fallback averages if no daily logs exist
  let avgSleep = 8;
  let avgSleepQualityScore = 80;
  let avgSteps = 7500;
  let avgExercise = 20;
  let avgWater = 5;
  let avgStress = 2.5;

  if (logs.length > 0) {
    // Take the last 7 logs (or all logs if less than 7)
    const recentLogs = logs.slice(-7);
    const sumSleep = recentLogs.reduce((acc, log) => acc + log.sleepHours, 0);
    const sumSteps = recentLogs.reduce((acc, log) => acc + log.steps, 0);
    const sumExercise = recentLogs.reduce((acc, log) => acc + log.exerciseMins, 0);
    const sumWater = recentLogs.reduce((acc, log) => acc + log.waterIntake, 0);
    const sumStress = recentLogs.reduce((acc, log) => acc + log.stressLevel, 0);
    
    avgSleep = sumSleep / recentLogs.length;
    avgSteps = sumSteps / recentLogs.length;
    avgExercise = sumExercise / recentLogs.length;
    avgWater = sumWater / recentLogs.length;
    avgStress = sumStress / recentLogs.length;

    const qualityPoints = recentLogs.reduce((acc, log) => {
      if (log.sleepQuality === 'good') return acc + 100;
      if (log.sleepQuality === 'average') return acc + 70;
      return acc + 40;
    }, 0);
    avgSleepQualityScore = qualityPoints / recentLogs.length;
  }

  // Sleep Score (20% weight) - Golden standard: 7-9 hours, adjust by quality
  // Distance from 8 hours
  const sleepDurationScore = Math.max(0, 100 - Math.abs(avgSleep - 8) * 25);
  const finalSleepScore = Math.round(sleepDurationScore * 0.6 + avgSleepQualityScore * 0.4);

  // Activity Score (25% weight)
  // Step score: up to 100% at 10000 steps
  const stepScore = Math.min(100, (avgSteps / 10000) * 100);
  // Exercise score: up to 100% at 30 minutes of exercise
  const exerciseScore = Math.min(100, (avgExercise / 30) * 100);
  const finalActivityScore = Math.round(stepScore * 0.5 + exerciseScore * 0.5);

  // Water Intake Score (15% weight)
  // Goal: 8 glasses (approx 2L)
  const finalWaterScore = Math.round(Math.min(100, (avgWater / 8) * 100));

  // Stress Score (10% weight) - Stress scale is 1 (low) to 5 (high)
  // 1 -> 100, 2 -> 80, 3 -> 60, 4 -> 40, 5 -> 20
  const finalStressScore = Math.round(100 - (avgStress - 1) * 20);

  // Weighted health score calculation
  const totalScore = Math.round(
    bmiScore * 0.30 +
    finalSleepScore * 0.20 +
    finalActivityScore * 0.25 +
    finalWaterScore * 0.15 +
    finalStressScore * 0.10
  );

  return {
    score: Math.min(100, Math.max(0, totalScore)),
    breakdown: {
      bmi: Math.round(bmiScore),
      sleep: Math.round(finalSleepScore),
      activity: Math.round(finalActivityScore),
      water: Math.round(finalWaterScore),
      stress: Math.round(finalStressScore),
    },
  };
}
