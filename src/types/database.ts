export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          gender: string;
          age: number;
          height: number;
          weight: number;
          activity_level: string;
          goal: string;
          bmr: number;
          daily_calories: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          gender?: string;
          age?: number;
          height?: number;
          weight?: number;
          activity_level?: string;
          goal?: string;
          bmr?: number;
          daily_calories?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          gender?: string;
          age?: number;
          height?: number;
          weight?: number;
          activity_level?: string;
          goal?: string;
          bmr?: number;
          daily_calories?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          calories: number;
          protein: number;
          fat: number;
          carbs: number;
          sodium: number | null;
          image_url: string | null;
          confidence: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          calories: number;
          protein?: number;
          fat?: number;
          carbs?: number;
          sodium?: number | null;
          image_url?: string | null;
          confidence?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          calories?: number;
          protein?: number;
          fat?: number;
          carbs?: number;
          sodium?: number | null;
          image_url?: string | null;
          confidence?: number;
          created_at?: string;
        };
      };
      analysis_alternatives: {
        Row: {
          id: string;
          meal_id: string;
          name: string;
          calories_diff: number;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          meal_id: string;
          name: string;
          calories_diff: number;
          reason: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          meal_id?: string;
          name?: string;
          calories_diff?: number;
          reason?: string;
          created_at?: string;
        };
      };
    };
  };
}
