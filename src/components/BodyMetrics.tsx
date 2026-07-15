import React, { useState, useEffect } from 'react';
import { UserProfile, WeightLog } from '../types';
import { 
  calculateBMI, 
  calculateBMR, 
  calculateTDEE, 
  calculateIdealWeightRange, 
  calculateWHR,
  cmToFtIn,
  ftInToCm,
  kgToLb,
  lbToKg
} from '../utils/calculations';
import { User, Activity, Flame, Shield, Scale, Ruler, Compass } from 'lucide-react';

interface BodyMetricsProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onAddWeightLog: (weight: number, date: string) => void;
}

export default function BodyMetrics({ profile, onUpdateProfile, onAddWeightLog }: BodyMetricsProps) {
  // Height inputs states
  const [ftFeet, setFtFeet] = useState<number>(5);
  const [ftInches, setFtInches] = useState<number>(6);
  const [cmHeight, setCmHeight] = useState<number>(profile.height);

  // Weight display state
  const [displayWeight, setDisplayWeight] = useState<number>(profile.weight);
  const [displayGoalWeight, setDisplayGoalWeight] = useState<number>(profile.goalWeight);

  // Measurements state
  const [waist, setWaist] = useState<string>(profile.waist?.toString() || '');
  const [hip, setHip] = useState<string>(profile.hip?.toString() || '');
  const [chest, setChest] = useState<string>(profile.chest?.toString() || '');

  // Synchronize internal inputs with profile changes
  useEffect(() => {
    setCmHeight(profile.height);
    const { feet, inches } = cmToFtIn(profile.height);
    setFtFeet(feet);
    setFtInches(inches);
  }, [profile.height]);

  useEffect(() => {
    if (profile.weightUnit === 'lb') {
      setDisplayWeight(Math.round(kgToLb(profile.weight) * 10) / 10);
    } else {
      setDisplayWeight(Math.round(profile.weight * 10) / 10);
    }
  }, [profile.weight, profile.weightUnit]);

  useEffect(() => {
    if (profile.weightUnit === 'lb') {
      setDisplayGoalWeight(Math.round(kgToLb(profile.goalWeight) * 10) / 10);
    } else {
      setDisplayGoalWeight(Math.round(profile.goalWeight * 10) / 10);
    }
  }, [profile.goalWeight, profile.weightUnit]);

  // Handle Height changes
  const handleCmChange = (val: number) => {
    setCmHeight(val);
    onUpdateProfile({ height: val });
  };

  const handleFtChange = (feet: number, inches: number) => {
    setFtFeet(feet);
    setFtInches(inches);
    const cm = ftInToCm(feet, inches);
    setCmHeight(Math.round(cm));
    onUpdateProfile({ height: Math.round(cm) });
  };

  // Handle Weight changes
  const handleWeightChange = (val: number) => {
    setDisplayWeight(val);
    let kg = val;
    if (profile.weightUnit === 'lb') {
      kg = lbToKg(val);
    }
    onUpdateProfile({ weight: kg });
  };

  // Handle Goal Weight changes
  const handleGoalWeightChange = (val: number) => {
    setDisplayGoalWeight(val);
    let kg = val;
    if (profile.weightUnit === 'lb') {
      kg = lbToKg(val);
    }
    onUpdateProfile({ goalWeight: kg });
  };

  // Save Measurements
  const handleSaveMeasurements = () => {
    const wNum = parseFloat(waist) || undefined;
    const hNum = parseFloat(hip) || undefined;
    const cNum = parseFloat(chest) || undefined;
    onUpdateProfile({ waist: wNum, hip: hNum, chest: cNum });
  };

  // Calculations
  const bmiResult = calculateBMI(profile.weight, profile.height);
  const bmrResult = calculateBMR(profile);
  const tdeeResult = calculateTDEE(bmrResult, profile.activityLevel);
  const idealRange = calculateIdealWeightRange(profile.height);
  const whrResult = calculateWHR(profile.waist, profile.hip, profile.gender);

  // Quick helper to log current weight as a trend entry
  const handleLogCurrentWeight = () => {
    const today = new Date().toISOString().split('T')[0];
    onAddWeightLog(profile.weight, today);
    alert("Logged current weight to trend history!");
  };

  // Unit conversion helpers for ideal range
  const displayMinIdeal = profile.weightUnit === 'lb' ? Math.round(kgToLb(idealRange.min)) : Math.round(idealRange.min);
  const displayMaxIdeal = profile.weightUnit === 'lb' ? Math.round(kgToLb(idealRange.max)) : Math.round(idealRange.max);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile Form (Left Panel - 2 cols) */}
      <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-200 p-6 space-y-6 shadow-none">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-500" />
            Personal Body Profile
          </h3>
          <p className="text-xs text-gray-400">Provide accurate statistics to calibrate metabolic formulas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500" htmlFor="profile-name">Full Name</label>
            <input 
              id="profile-name"
              type="text" 
              value={profile.name}
              onChange={(e) => onUpdateProfile({ name: e.target.value })}
              className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              placeholder="Your name"
            />
          </div>

          {/* Age */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500" htmlFor="profile-age">Age (Years)</label>
            <input 
              id="profile-age"
              type="number" 
              value={profile.age}
              onChange={(e) => onUpdateProfile({ age: parseInt(e.target.value) || 0 })}
              className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              min="1"
              max="120"
            />
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500" htmlFor="profile-gender">Gender Identity</label>
            <select 
              id="profile-gender"
              value={profile.gender}
              onChange={(e) => onUpdateProfile({ gender: e.target.value as any })}
              className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition bg-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other / Prefer not to say</option>
            </select>
          </div>

          {/* Goal Select */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500" htmlFor="profile-goal">Weight Management Goal</label>
            <select 
              id="profile-goal"
              value={profile.goal}
              onChange={(e) => onUpdateProfile({ goal: e.target.value as any })}
              className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition bg-white"
            >
              <option value="lose">Lose Weight</option>
              <option value="maintain">Maintain Weight</option>
              <option value="gain">Gain Weight</option>
            </select>
          </div>
        </div>

        {/* Height and Weight Toggles & Inputs */}
        <div className="border-t border-gray-100 pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Height Input Block */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <Ruler className="w-4 h-4 text-emerald-500" />
                Stature Height
              </label>
              <div className="inline-flex bg-gray-100 p-0.5 rounded-lg text-[10px] font-bold">
                <button 
                  id="height-cm-toggle"
                  type="button"
                  onClick={() => onUpdateProfile({ heightUnit: 'cm' })}
                  className={`px-2 py-1 rounded-md transition ${profile.heightUnit === 'cm' ? 'bg-white text-emerald-600 shadow-xs' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Metric (cm)
                </button>
                <button 
                  id="height-ft-toggle"
                  type="button"
                  onClick={() => onUpdateProfile({ heightUnit: 'ft' })}
                  className={`px-2 py-1 rounded-md transition ${profile.heightUnit === 'ft' ? 'bg-white text-emerald-600 shadow-xs' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Imperial (ft)
                </button>
              </div>
            </div>

            {profile.heightUnit === 'cm' ? (
              <div className="relative">
                <input 
                  id="height-cm-input"
                  type="number" 
                  value={cmHeight}
                  onChange={(e) => handleCmChange(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  min="50"
                  max="250"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 font-mono">cm</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input 
                    id="height-ft-input"
                    type="number" 
                    value={ftFeet}
                    onChange={(e) => handleFtChange(parseInt(e.target.value) || 0, ftInches)}
                    className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    min="1"
                    max="8"
                    placeholder="Feet"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-gray-400">ft</span>
                </div>
                <div className="relative">
                  <input 
                    id="height-in-input"
                    type="number" 
                    value={ftInches}
                    onChange={(e) => handleFtChange(ftFeet, parseInt(e.target.value) || 0)}
                    className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    min="0"
                    max="11"
                    placeholder="Inches"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-gray-400">in</span>
                </div>
              </div>
            )}
          </div>

          {/* Weight Input Block */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <Scale className="w-4 h-4 text-emerald-500" />
                Current Weight
              </label>
              <div className="inline-flex bg-gray-100 p-0.5 rounded-lg text-[10px] font-bold">
                <button 
                  id="weight-kg-toggle"
                  type="button"
                  onClick={() => onUpdateProfile({ weightUnit: 'kg' })}
                  className={`px-2 py-1 rounded-md transition ${profile.weightUnit === 'kg' ? 'bg-white text-emerald-600 shadow-xs' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Kilos (kg)
                </button>
                <button 
                  id="weight-lb-toggle"
                  type="button"
                  onClick={() => onUpdateProfile({ weightUnit: 'lb' })}
                  className={`px-2 py-1 rounded-md transition ${profile.weightUnit === 'lb' ? 'bg-white text-emerald-600 shadow-xs' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Pounds (lb)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input 
                  id="weight-input"
                  type="number" 
                  step="0.1"
                  value={displayWeight}
                  onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  min="10"
                  max="500"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 font-mono">{profile.weightUnit}</span>
              </div>
              <div className="relative">
                <input 
                  id="goal-weight-input"
                  type="number" 
                  step="0.1"
                  value={displayGoalWeight}
                  onChange={(e) => handleGoalWeightChange(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  min="10"
                  max="500"
                  placeholder="Goal Weight"
                />
                <span className="absolute right-3.5 top-2.5 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Goal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Level Selector */}
        <div className="border-t border-gray-100 pt-5 space-y-3">
          <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            <Activity className="w-4 h-4 text-emerald-500" />
            Physical Activity Factor
          </label>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { id: 'sedentary', title: 'Sedentary', desc: 'Little/no exercise, desk job' },
              { id: 'light', title: 'Light', desc: 'Light workout 1-3 days/wk' },
              { id: 'moderate', title: 'Moderate', desc: 'Moderate activity 3-5 days/wk' },
              { id: 'active', title: 'Active', desc: 'Hard training 6-7 days/wk' },
              { id: 'very_active', title: 'Very Active', desc: 'Athletic, heavy manual labor' },
            ].map((item) => (
              <button
                key={item.id}
                id={`activity-${item.id}-btn`}
                type="button"
                onClick={() => onUpdateProfile({ activityLevel: item.id as any })}
                className={`flex flex-col items-center justify-between p-3 rounded-xl border text-center transition ${profile.activityLevel === item.id ? 'bg-slate-100 border-slate-200 text-emerald-500 shadow-none' : 'bg-gray-50/50 border-gray-100 hover:bg-gray-50 text-gray-700'}`}
              >
                <span className="text-xs font-bold leading-tight mb-1">{item.title}</span>
                <span className={`text-[9px] leading-snug ${profile.activityLevel === item.id ? 'text-emerald-600/80' : 'text-gray-400'}`}>
                  {item.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Optional Anthropometric Measurements */}
        <div className="border-t border-gray-100 pt-5 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <Compass className="w-4.5 h-4.5 text-emerald-500" />
              Body Measurements (Optional)
            </h4>
            <p className="text-xs text-gray-400">Used for deep-dive calculations such as Waist-to-Hip Ratio (WHR).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="text-[11px] font-semibold text-gray-400 block mb-1">Waist Circumference</label>
              <input 
                id="waist-input"
                type="number" 
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                placeholder="Waist in cm"
              />
              <span className="absolute right-3 bottom-2 text-xs text-gray-400">cm</span>
            </div>

            <div className="relative">
              <label className="text-[11px] font-semibold text-gray-400 block mb-1">Hip Circumference</label>
              <input 
                id="hip-input"
                type="number" 
                value={hip}
                onChange={(e) => setHip(e.target.value)}
                className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                placeholder="Hip in cm"
              />
              <span className="absolute right-3 bottom-2 text-xs text-gray-400">cm</span>
            </div>

            <div className="relative">
              <label className="text-[11px] font-semibold text-gray-400 block mb-1">Chest Circumference</label>
              <input 
                id="chest-input"
                type="number" 
                value={chest}
                onChange={(e) => setChest(e.target.value)}
                className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                placeholder="Chest in cm"
              />
              <span className="absolute right-3 bottom-2 text-xs text-gray-400">cm</span>
            </div>
          </div>

          <div className="flex justify-between items-center gap-3">
            <button 
              id="save-measurements-btn"
              type="button" 
              onClick={handleSaveMeasurements}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition"
            >
              Save Measurements
            </button>
            <button
              id="log-weight-history-btn"
              type="button"
              onClick={handleLogCurrentWeight}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-100 transition"
            >
              Log Weight in Trend History
            </button>
          </div>
        </div>
      </div>

      {/* Math Metrics Outputs (Right Panel - 1 col) */}
      <div className="space-y-6">
        
        {/* BMI Card */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-4 shadow-none">
          <h4 className="font-bold text-gray-800 text-base">BMI (Body Mass Index)</h4>
          
          <div className="flex justify-between items-baseline bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div>
              <span className="text-3xl font-extrabold text-gray-800">{bmiResult.score}</span>
              <span className="text-xs text-gray-400 ml-1 font-mono">kg/m²</span>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${bmiResult.color}`}>
              {bmiResult.category}
            </span>
          </div>

          {/* Color bar indicator */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-gray-400 font-semibold font-mono">
              <span>Under (&lt;18.5)</span>
              <span>Norm (18.5-25)</span>
              <span>Over (25-30)</span>
              <span>Obese (&gt;30)</span>
            </div>
            <div className="relative h-2.5 bg-gray-100 rounded-full flex overflow-hidden">
              <div className="h-full bg-amber-400/80" style={{ width: '25%' }} />
              <div className="h-full bg-emerald-400/80" style={{ width: '25%' }} />
              <div className="h-full bg-orange-400/80" style={{ width: '25%' }} />
              <div className="h-full bg-rose-400/80" style={{ width: '25%' }} />
              
              {/* Pointer */}
              {bmiResult.score > 0 && (
                <div 
                  className="absolute top-0 bottom-0 w-1.5 bg-gray-900 border border-white rounded-full transition-all duration-500" 
                  style={{ 
                    left: `${Math.min(98, Math.max(2, ((bmiResult.score - 14) / 22) * 100))}%`, 
                    transform: 'translateX(-50%)' 
                  }} 
                />
              )}
            </div>
          </div>

          {/* WHR Display if available */}
          {whrResult.risk !== 'N/A' && (
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <span className="text-xs font-semibold text-gray-400 block">Waist-to-Hip Ratio (WHR)</span>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="space-y-0.5">
                  <span className="text-lg font-bold text-gray-800 font-mono">{whrResult.ratio}</span>
                  <span className="text-[9px] text-gray-400 block font-medium">Waist / Hip</span>
                </div>
                <div className={`text-xs font-bold px-3 py-1 rounded-full border ${whrResult.color}`}>
                  {whrResult.risk} Cardiovascular Risk
                </div>
              </div>
            </div>
          )}

          {/* Ideal weight range */}
          <div className="border-t border-gray-100 pt-4 space-y-1.5 text-xs">
            <span className="font-semibold text-gray-500">Ideal Weight Range (BMI 18.5-24.9)</span>
            <p className="text-base font-bold text-gray-800">
              {displayMinIdeal} – {displayMaxIdeal} <span className="font-normal text-gray-500">{profile.weightUnit}</span>
            </p>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Calculated on physical height parameters of {profile.height} cm.
            </p>
          </div>
        </div>

        {/* Energy Balance Card */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-4 shadow-none">
          <div className="space-y-0.5">
            <h4 className="font-bold text-gray-800 text-base flex items-center gap-1.5">
              <Flame className="w-5 h-5 text-emerald-500" />
              Energy Metabolism
            </h4>
            <p className="text-xs text-gray-400">Resting and active thermodynamic rates.</p>
          </div>

          <div className="space-y-3.5">
            {/* BMR */}
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-gray-700">BMR (Basal Metabolic Rate)</span>
                <span className="text-base font-extrabold text-gray-800 font-mono">
                  {bmrResult} <span className="text-xs font-normal text-gray-500">kcal</span>
                </span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Energy your body burns in complete rested state to maintain critical systems.
              </p>
            </div>

            {/* TDEE */}
            <div className="space-y-1 border-t border-gray-50 pt-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-gray-700">TDEE (Total Daily Expenditure)</span>
                <span className="text-base font-extrabold text-emerald-600 font-mono">
                  {tdeeResult} <span className="text-xs font-normal text-emerald-500">kcal</span>
                </span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Energy expended daily considering activity level factor ({profile.activityLevel.replace('_', ' ')}).
              </p>
            </div>
          </div>

          <div className="bg-emerald-50/40 p-3.5 rounded-2xl border border-emerald-100/30 text-[10px] text-emerald-800 leading-relaxed flex gap-2">
            <Shield className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
            <div>
              <span className="font-bold">Thermodynamic tip:</span> To achieve {profile.goal} goals, configure your customized meal targets in the "Improvement Plan" tab.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
