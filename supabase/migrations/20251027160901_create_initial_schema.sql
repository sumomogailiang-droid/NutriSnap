/*
  # NutriSnap Initial Database Schema

  ## Overview
  Creates the core database schema for the NutriSnap calorie tracking application with AI-powered meal analysis.

  ## New Tables

  ### `profiles`
  User profile information and settings
  - `id` (uuid, primary key) - References auth.users
  - `name` (text) - User's display name
  - `email` (text) - User's email address
  - `gender` (text) - User's gender (male/female/other)
  - `age` (integer) - User's age
  - `height` (integer) - User's height in cm
  - `weight` (numeric) - User's weight in kg
  - `activity_level` (text) - Activity level (low/medium/high)
  - `goal` (text) - Fitness goal (lose/maintain/gain)
  - `bmr` (integer) - Basal Metabolic Rate
  - `daily_calories` (integer) - Target daily calorie intake
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `meals`
  Food meal records with nutritional information
  - `id` (uuid, primary key) - Unique meal identifier
  - `user_id` (uuid, foreign key) - References profiles
  - `name` (text) - Meal/dish name
  - `calories` (integer) - Total calories
  - `protein` (numeric) - Protein in grams
  - `fat` (numeric) - Fat in grams
  - `carbs` (numeric) - Carbohydrates in grams
  - `sodium` (numeric, nullable) - Sodium in grams
  - `image_url` (text, nullable) - URL to meal image in storage
  - `confidence` (numeric) - AI recognition confidence (0-1)
  - `created_at` (timestamptz) - Meal creation timestamp

  ### `analysis_alternatives`
  Healthier alternative suggestions for meals
  - `id` (uuid, primary key) - Unique alternative identifier
  - `meal_id` (uuid, foreign key) - References meals
  - `name` (text) - Alternative dish name
  - `calories_diff` (integer) - Calorie difference from original
  - `reason` (text) - Explanation for suggestion
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only access their own data
  - Policies enforce authentication and ownership checks

  ### Policies

  #### profiles table
  1. Users can view their own profile (SELECT)
  2. Users can insert their own profile (INSERT)
  3. Users can update their own profile (UPDATE)
  4. Users can delete their own profile (DELETE)

  #### meals table
  1. Users can view their own meals (SELECT)
  2. Users can insert their own meals (INSERT)
  3. Users can update their own meals (UPDATE)
  4. Users can delete their own meals (DELETE)

  #### analysis_alternatives table
  1. Users can view alternatives for their meals (SELECT)
  2. Users can insert alternatives for their meals (INSERT)
  3. Users can delete alternatives for their meals (DELETE)

  ## Important Notes
  - All timestamps use timestamptz with automatic defaults
  - Foreign keys ensure referential integrity
  - Indexes on user_id columns for query performance
  - Numeric types used for precise nutritional values
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  gender text NOT NULL DEFAULT 'male',
  age integer NOT NULL DEFAULT 30,
  height integer NOT NULL DEFAULT 170,
  weight numeric(5,1) NOT NULL DEFAULT 70.0,
  activity_level text NOT NULL DEFAULT 'medium',
  goal text NOT NULL DEFAULT 'maintain',
  bmr integer NOT NULL DEFAULT 1500,
  daily_calories integer NOT NULL DEFAULT 2000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  calories integer NOT NULL,
  protein numeric(6,1) NOT NULL DEFAULT 0,
  fat numeric(6,1) NOT NULL DEFAULT 0,
  carbs numeric(6,1) NOT NULL DEFAULT 0,
  sodium numeric(6,1),
  image_url text,
  confidence numeric(3,2) DEFAULT 0.95,
  created_at timestamptz DEFAULT now()
);

-- Create analysis_alternatives table
CREATE TABLE IF NOT EXISTS analysis_alternatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id uuid NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  name text NOT NULL,
  calories_diff integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_created_at ON meals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_alternatives_meal_id ON analysis_alternatives(meal_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_alternatives ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Meals policies
CREATE POLICY "Users can view own meals"
  ON meals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own meals"
  ON meals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Analysis alternatives policies
CREATE POLICY "Users can view alternatives for own meals"
  ON analysis_alternatives FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = analysis_alternatives.meal_id
      AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert alternatives for own meals"
  ON analysis_alternatives FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = analysis_alternatives.meal_id
      AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete alternatives for own meals"
  ON analysis_alternatives FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = analysis_alternatives.meal_id
      AND meals.user_id = auth.uid()
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();