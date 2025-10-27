import { create } from 'zustand';
import type { Meal, UserProfile, ToastMessage, AnalysisResult } from '../types';
import { supabase } from '../lib/supabase';

interface AppState {
  meals: Meal[];
  userProfile: UserProfile | null;
  toasts: ToastMessage[];
  currentAnalysis: AnalysisResult | null;
  loading: boolean;
  loadProfile: (userId: string) => Promise<void>;
  loadMeals: (userId: string) => Promise<void>;
  addMeal: (meal: Omit<Meal, 'id' | 'timestamp'>, userId: string) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>, userId: string) => Promise<void>;
  addToast: (message: string, type: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  getTodayCalories: () => number;
  clearData: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  meals: [],
  userProfile: null,
  toasts: [],
  currentAnalysis: null,
  loading: false,

  loadProfile: async (userId: string) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data && !error) {
      set({
        userProfile: {
          name: data.name,
          email: data.email,
          gender: data.gender as 'male' | 'female' | 'other',
          age: data.age,
          height: data.height,
          weight: data.weight,
          activityLevel: data.activity_level as 'low' | 'medium' | 'high',
          goal: data.goal as 'lose' | 'maintain' | 'gain',
          bmr: data.bmr,
          dailyCalories: data.daily_calories,
        },
      });
    }
    set({ loading: false });
  },

  loadMeals: async (userId: string) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data && !error) {
      const meals: Meal[] = data.map((meal) => ({
        id: meal.id,
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        fat: meal.fat,
        carbs: meal.carbs,
        timestamp: meal.created_at,
        imageUrl: meal.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      }));
      set({ meals });
    }
    set({ loading: false });
  },

  addMeal: async (meal, userId) => {
    const { data, error } = await supabase
      .from('meals')
      .insert({
        user_id: userId,
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        fat: meal.fat,
        carbs: meal.carbs,
        image_url: meal.imageUrl,
        confidence: 0.95,
      })
      .select()
      .single();

    if (data && !error) {
      const newMeal: Meal = {
        id: data.id,
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        fat: data.fat,
        carbs: data.carbs,
        timestamp: data.created_at,
        imageUrl: data.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      };
      set((state) => ({ meals: [newMeal, ...state.meals] }));
      get().addToast('食事を記録しました', 'success');
    } else {
      get().addToast('食事の記録に失敗しました', 'error');
    }
  },

  removeMeal: async (id) => {
    const { error } = await supabase.from('meals').delete().eq('id', id);

    if (!error) {
      set((state) => ({ meals: state.meals.filter((meal) => meal.id !== id) }));
      get().addToast('食事を削除しました', 'success');
    } else {
      get().addToast('食事の削除に失敗しました', 'error');
    }
  },

  updateProfile: async (profile, userId) => {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (profile.name !== undefined) updateData.name = profile.name;
    if (profile.email !== undefined) updateData.email = profile.email;
    if (profile.gender !== undefined) updateData.gender = profile.gender;
    if (profile.age !== undefined) updateData.age = profile.age;
    if (profile.height !== undefined) updateData.height = profile.height;
    if (profile.weight !== undefined) updateData.weight = profile.weight;
    if (profile.activityLevel !== undefined) updateData.activity_level = profile.activityLevel;
    if (profile.goal !== undefined) updateData.goal = profile.goal;
    if (profile.bmr !== undefined) updateData.bmr = profile.bmr;
    if (profile.dailyCalories !== undefined) updateData.daily_calories = profile.dailyCalories;

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (!error) {
      set((state) => ({
        userProfile: state.userProfile ? { ...state.userProfile, ...profile } : null,
      }));
      get().addToast('プロフィールを更新しました', 'success');
    } else {
      get().addToast('プロフィールの更新に失敗しました', 'error');
    }
  },

  addToast: (message, type) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 3000);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
  },

  setCurrentAnalysis: (analysis) => {
    set({ currentAnalysis: analysis });
  },

  getTodayCalories: () => {
    const today = new Date().toDateString();
    return get().meals
      .filter((meal) => new Date(meal.timestamp).toDateString() === today)
      .reduce((total, meal) => total + meal.calories, 0);
  },

  clearData: () => {
    set({ meals: [], userProfile: null, currentAnalysis: null });
  },
}));
