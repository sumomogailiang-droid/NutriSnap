export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageLimit {
  id: string;
  user_id: string;
  date: string;
  meal_scans_count: number;
  ai_chat_count: number;
  created_at: string;
}

export interface PlanFeature {
  id: string;
  plan_id: string;
  feature_key: string;
  feature_value: Record<string, any>;
  created_at: string;
}

export interface SubscriptionHistory {
  id: string;
  user_id: string;
  subscription_id: string | null;
  event_type: string;
  old_plan_id: string | null;
  new_plan_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}
