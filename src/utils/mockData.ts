import type { Meal, AnalysisResult, UserProfile, WeeklyStat, MacroBalance } from '../types';

export const mockMeals: Meal[] = [
  {
    id: '1',
    name: 'ハンバーグ定食',
    calories: 850,
    protein: 35,
    fat: 42,
    carbs: 75,
    timestamp: '2025-10-27T12:30:00',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
  },
  {
    id: '2',
    name: 'トースト&スクランブルエッグ',
    calories: 420,
    protein: 18,
    fat: 22,
    carbs: 38,
    timestamp: '2025-10-27T08:00:00',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
  },
  {
    id: '3',
    name: '寿司（にぎり10貫）',
    calories: 620,
    protein: 42,
    fat: 8,
    carbs: 95,
    timestamp: '2025-10-26T19:00:00',
    imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
  },
];

export const mockAnalysisResult: AnalysisResult = {
  dishName: 'カルボナーラ',
  confidence: 0.92,
  calories: 780,
  macros: {
    protein: 28,
    fat: 45,
    carbs: 65,
    sodium: 2.8
  },
  alternatives: [
    {
      name: 'ペペロンチーノ',
      caloriesDiff: -200,
      reason: 'オイルベースで軽め。食物繊維も豊富'
    },
    {
      name: '和風パスタ（きのこ）',
      caloriesDiff: -150,
      reason: 'きのこで満足感UP。低脂質'
    },
    {
      name: 'トマトソースパスタ',
      caloriesDiff: -180,
      reason: 'リコピン豊富。クリームより低カロリー'
    },
  ],
};

export const mockUserProfile: UserProfile = {
  name: '田中 美咲',
  email: 'misaki.tanaka@example.com',
  gender: 'female',
  age: 28,
  height: 162,
  weight: 58,
  activityLevel: 'medium',
  goal: 'lose',
  bmr: 1342,
  dailyCalories: 1876,
};

export const mockWeeklyStats: WeeklyStat[] = [
  { date: '10/21', calories: 1850 },
  { date: '10/22', calories: 2100 },
  { date: '10/23', calories: 1780 },
  { date: '10/24', calories: 1920 },
  { date: '10/25', calories: 2050 },
  { date: '10/26', calories: 1680 },
  { date: '10/27', calories: 1245 },
];

export const mockMacroBalance: MacroBalance = {
  protein: 25,
  fat: 30,
  carbs: 45,
};
