/*
  # Subscription System Schema

  ## Overview
  Creates comprehensive subscription system for NutriSnap with plan management,
  usage tracking, and Stripe integration.

  ## New Tables

  ### `subscriptions`
  User subscription records with Stripe integration
  - `id` (uuid, primary key) - Unique subscription identifier
  - `user_id` (uuid, foreign key) - References profiles
  - `plan_id` (text) - Plan identifier (free/premium/pro/family/fitness)
  - `status` (text) - Subscription status (active/canceled/past_due/trialing)
  - `current_period_start` (timestamptz) - Billing period start
  - `current_period_end` (timestamptz) - Billing period end
  - `cancel_at_period_end` (boolean) - Scheduled cancellation flag
  - `trial_end` (timestamptz) - Trial period end date
  - `stripe_customer_id` (text) - Stripe customer ID
  - `stripe_subscription_id` (text) - Stripe subscription ID
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `usage_limits`
  Daily usage tracking per user
  - `id` (uuid, primary key) - Unique usage record identifier
  - `user_id` (uuid, foreign key) - References profiles
  - `date` (date) - Usage date
  - `meal_scans_count` (integer) - Number of meal scans performed
  - `ai_chat_count` (integer) - Number of AI chat interactions
  - `created_at` (timestamptz) - Record creation timestamp

  ### `plan_features`
  Feature definitions per plan
  - `id` (uuid, primary key) - Unique feature identifier
  - `plan_id` (text) - Plan identifier
  - `feature_key` (text) - Feature identifier
  - `feature_value` (jsonb) - Feature configuration
  - `created_at` (timestamptz) - Record creation timestamp

  ### `subscription_history`
  Historical record of subscription changes
  - `id` (uuid, primary key) - Unique history record identifier
  - `user_id` (uuid, foreign key) - References profiles
  - `subscription_id` (uuid) - Related subscription ID
  - `event_type` (text) - Event type (created/updated/canceled)
  - `old_plan_id` (text) - Previous plan
  - `new_plan_id` (text) - New plan
  - `metadata` (jsonb) - Additional event data
  - `created_at` (timestamptz) - Event timestamp

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only access their own subscription data
  - Policies enforce authentication and ownership

  ## Indexes
  - Foreign key indexes for optimal query performance
  - Composite indexes for common query patterns
  - Unique constraints on critical fields

  ## Important Notes
  - Default plan is 'free' for new users
  - Trial period is 7 days for paid plans
  - Usage limits reset daily at midnight UTC
  - Proper cascade deletion for data cleanup
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  trial_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_plan CHECK (plan_id IN ('free', 'premium', 'pro', 'family', 'fitness')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete'))
);

-- Create usage_limits table
CREATE TABLE IF NOT EXISTS usage_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  meal_scans_count integer DEFAULT 0,
  ai_chat_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create plan_features table
CREATE TABLE IF NOT EXISTS plan_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id text NOT NULL,
  feature_key text NOT NULL,
  feature_value jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(plan_id, feature_key)
);

-- Create subscription_history table
CREATE TABLE IF NOT EXISTS subscription_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id uuid,
  event_type text NOT NULL,
  old_plan_id text,
  new_plan_id text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_date ON usage_limits(user_id, date);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Usage limits policies
CREATE POLICY "Users can view own usage"
  ON usage_limits FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own usage"
  ON usage_limits FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own usage"
  ON usage_limits FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Plan features policies (public read)
CREATE POLICY "Anyone can view plan features"
  ON plan_features FOR SELECT
  TO authenticated
  USING (true);

-- Subscription history policies
CREATE POLICY "Users can view own history"
  ON subscription_history FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Create function to update subscription updated_at
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
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

-- Create trigger for subscriptions
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- Create function to track subscription changes
CREATE OR REPLACE FUNCTION track_subscription_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO subscription_history (user_id, subscription_id, event_type, new_plan_id, metadata)
    VALUES (NEW.user_id, NEW.id, 'created', NEW.plan_id, row_to_json(NEW)::jsonb);
  ELSIF TG_OP = 'UPDATE' AND OLD.plan_id != NEW.plan_id THEN
    INSERT INTO subscription_history (user_id, subscription_id, event_type, old_plan_id, new_plan_id, metadata)
    VALUES (NEW.user_id, NEW.id, 'plan_changed', OLD.plan_id, NEW.plan_id, jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO subscription_history (user_id, subscription_id, event_type, old_plan_id, new_plan_id, metadata)
    VALUES (NEW.user_id, NEW.id, 'status_changed', NEW.plan_id, NEW.plan_id, jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for subscription history
DROP TRIGGER IF EXISTS track_subscription_changes ON subscriptions;
CREATE TRIGGER track_subscription_changes
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION track_subscription_change();

-- Insert default plan features
INSERT INTO plan_features (plan_id, feature_key, feature_value) VALUES
  ('free', 'daily_scans', '{"limit": 3, "unlimited": false}'::jsonb),
  ('free', 'history_days', '{"days": 7}'::jsonb),
  ('free', 'ai_chat', '{"enabled": false}'::jsonb),
  ('free', 'family_accounts', '{"limit": 0}'::jsonb),
  ('free', 'export_data', '{"enabled": false}'::jsonb),
  ('free', 'ads_enabled', '{"enabled": true}'::jsonb),
  
  ('premium', 'daily_scans', '{"limit": -1, "unlimited": true}'::jsonb),
  ('premium', 'history_days', '{"days": 30}'::jsonb),
  ('premium', 'ai_chat', '{"enabled": false}'::jsonb),
  ('premium', 'family_accounts', '{"limit": 0}'::jsonb),
  ('premium', 'export_data', '{"enabled": true}'::jsonb),
  ('premium', 'ads_enabled', '{"enabled": false}'::jsonb),
  
  ('pro', 'daily_scans', '{"limit": -1, "unlimited": true}'::jsonb),
  ('pro', 'history_days', '{"days": -1, "unlimited": true}'::jsonb),
  ('pro', 'ai_chat', '{"enabled": true, "hours": 24}'::jsonb),
  ('pro', 'family_accounts', '{"limit": 4}'::jsonb),
  ('pro', 'export_data', '{"enabled": true}'::jsonb),
  ('pro', 'ads_enabled', '{"enabled": false}'::jsonb),
  
  ('family', 'daily_scans', '{"limit": -1, "unlimited": true}'::jsonb),
  ('family', 'history_days', '{"days": -1, "unlimited": true}'::jsonb),
  ('family', 'ai_chat', '{"enabled": true, "hours": 24}'::jsonb),
  ('family', 'family_accounts', '{"limit": 6}'::jsonb),
  ('family', 'export_data', '{"enabled": true}'::jsonb),
  ('family', 'ads_enabled', '{"enabled": false}'::jsonb),
  
  ('fitness', 'daily_scans', '{"limit": -1, "unlimited": true}'::jsonb),
  ('fitness', 'history_days', '{"days": 30}'::jsonb),
  ('fitness', 'ai_chat', '{"enabled": false}'::jsonb),
  ('fitness', 'family_accounts', '{"limit": 0}'::jsonb),
  ('fitness', 'export_data', '{"enabled": true}'::jsonb),
  ('fitness', 'ads_enabled', '{"enabled": false}'::jsonb),
  ('fitness', 'fitness_features', '{"enabled": true}'::jsonb)
ON CONFLICT (plan_id, feature_key) DO NOTHING;

-- Function to create default subscription for new users
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan_id, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create subscription for new users
DROP TRIGGER IF EXISTS create_user_subscription ON profiles;
CREATE TRIGGER create_user_subscription
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();