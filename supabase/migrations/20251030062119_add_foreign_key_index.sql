/*
  # Add Missing Foreign Key Index

  ## Overview
  Adds index for foreign key constraint to optimize query performance.

  ## Changes

  ### 1. Add Index for Foreign Key
  - Create index on `analysis_alternatives.meal_id` column
  - This covers the foreign key constraint `analysis_alternatives_meal_id_fkey`
  - Improves JOIN and foreign key constraint check performance

  ## Performance Improvements
  - Faster queries when joining analysis_alternatives with meals
  - Improved performance for foreign key constraint validation
  - Better query execution plans for related queries

  ## Important Notes
  - This is a non-breaking change
  - No data loss or schema modification
  - Pure performance optimization
*/

-- Create index for meal_id foreign key in analysis_alternatives table
CREATE INDEX IF NOT EXISTS idx_analysis_alternatives_meal_id 
  ON analysis_alternatives(meal_id);