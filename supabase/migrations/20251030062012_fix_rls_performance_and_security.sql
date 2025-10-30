/*
  # Fix RLS Performance and Security Issues

  ## Overview
  Optimizes Row Level Security policies for better performance at scale and fixes security issues.

  ## Changes

  ### 1. RLS Policy Performance Optimization
  - Replace `auth.uid()` with `(select auth.uid())` in all policies
  - This prevents re-evaluation of auth function for each row
  - Significantly improves query performance at scale

  ### 2. Remove Unused Indexes
  - Drop `idx_meals_created_at` (unused)
  - Drop `idx_analysis_alternatives_meal_id` (unused)

  ### 3. Fix Function Search Path
  - Update `update_updated_at_column` function with immutable search path

  ## Security Improvements
  - Optimized policies maintain same security level
  - Better performance under load
  - Proper function security configuration

  ## Important Notes
  - All existing RLS policies are dropped and recreated
  - No data loss or schema changes
  - Performance improvement with same security guarantees
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own meals" ON meals;
DROP POLICY IF EXISTS "Users can insert own meals" ON meals;
DROP POLICY IF EXISTS "Users can update own meals" ON meals;
DROP POLICY IF EXISTS "Users can delete own meals" ON meals;

DROP POLICY IF EXISTS "Users can view alternatives for own meals" ON analysis_alternatives;
DROP POLICY IF EXISTS "Users can insert alternatives for own meals" ON analysis_alternatives;
DROP POLICY IF EXISTS "Users can delete alternatives for own meals" ON analysis_alternatives;

-- Recreate profiles policies with optimized auth checks
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = id);

-- Recreate meals policies with optimized auth checks
CREATE POLICY "Users can view own meals"
  ON meals FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own meals"
  ON meals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Recreate analysis_alternatives policies with optimized auth checks
CREATE POLICY "Users can view alternatives for own meals"
  ON analysis_alternatives FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = analysis_alternatives.meal_id
      AND meals.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert alternatives for own meals"
  ON analysis_alternatives FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = analysis_alternatives.meal_id
      AND meals.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete alternatives for own meals"
  ON analysis_alternatives FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = analysis_alternatives.meal_id
      AND meals.user_id = (select auth.uid())
    )
  );

-- Drop unused indexes
DROP INDEX IF EXISTS idx_meals_created_at;
DROP INDEX IF EXISTS idx_analysis_alternatives_meal_id;

-- Drop trigger first, then function
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Recreate function with proper search path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();