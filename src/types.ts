export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // Stored in cm
  heightUnit: 'cm' | 'ft'; // Display preference
  weight: number; // Stored in kg
  weightUnit: 'kg' | 'lb'; // Display preference
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  goalWeight: number; // Stored in kg
  waist?: number; // cm
  hip?: number; // cm
  chest?: number; // cm
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  sleepHours: number;
  sleepQuality: 'good' | 'average' | 'poor';
  waterIntake: number; // Glasses
  steps: number;
  exerciseMins: number;
  mood: 'sad' | 'neutral' | 'happy' | 'joy' | 'excited'; // 😢 | 😐 | 🙂 | 😀 | 🔥
  stressLevel: number; // 1-5
  journalNotes: string;
}

export interface WeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // Stored in kg
}

export interface WorkoutLog {
  id: string;
  date: string; // YYYY-MM-DD
  type: string;
  duration: number; // mins
  intensity: 'low' | 'moderate' | 'high';
}

export interface OuterHealthAssessment {
  id: string;
  date: string;
  skinRating: number; // 1-5
  hairRating: number; // 1-5
  postureRating: number; // 1-5
}

export type ActiveTab = 
  | 'dashboard' 
  | 'metrics' 
  | 'checkin' 
  | 'inner' 
  | 'outer' 
  | 'plan' 
  | 'history';
