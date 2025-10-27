export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  timestamp: string;
  imageUrl: string;
}

export interface MacroNutrients {
  protein: number;
  fat: number;
  carbs: number;
  sodium?: number;
}

export interface Alternative {
  name: string;
  caloriesDiff: number;
  reason: string;
}

export interface AnalysisResult {
  dishName: string;
  confidence: number;
  calories: number;
  macros: MacroNutrients;
  alternatives: Alternative[];
  imageUrl?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  height: number;
  weight: number;
  activityLevel: 'low' | 'medium' | 'high';
  goal: 'maintain' | 'lose' | 'gain';
  bmr: number;
  dailyCalories: number;
}

export interface WeeklyStat {
  date: string;
  calories: number;
}

export interface MacroBalance {
  protein: number;
  fat: number;
  carbs: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
