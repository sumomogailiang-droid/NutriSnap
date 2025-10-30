import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Subscription, UsageLimit } from '../types/subscription';
import { getRemainingScans, PLAN_LIMITS } from '../utils/planLimits';

export function useSubscription(userId: string | undefined) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageLimit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadSubscription();
    loadTodayUsage();
  }, [userId]);

  const loadSubscription = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data && !error) {
      setSubscription(data as Subscription);
    }
    setLoading(false);
  };

  const loadTodayUsage = async () => {
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (data && !error) {
      setUsage(data as UsageLimit);
    } else if (!data) {
      const { data: newUsage, error: insertError } = await supabase
        .from('usage_limits')
        .insert({
          user_id: userId,
          date: today,
          meal_scans_count: 0,
          ai_chat_count: 0,
        })
        .select()
        .single();

      if (newUsage && !insertError) {
        setUsage(newUsage as UsageLimit);
      }
    }
  };

  const incrementScanCount = async (): Promise<boolean> => {
    if (!userId || !subscription) return false;

    const planLimits = PLAN_LIMITS[subscription.plan_id];
    if (!planLimits) return false;

    if (planLimits.dailyScans === -1) return true;

    const currentCount = usage?.meal_scans_count || 0;
    if (currentCount >= planLimits.dailyScans) {
      return false;
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('usage_limits')
      .upsert({
        user_id: userId,
        date: today,
        meal_scans_count: currentCount + 1,
        ai_chat_count: usage?.ai_chat_count || 0,
      }, {
        onConflict: 'user_id,date',
      })
      .select()
      .single();

    if (data && !error) {
      setUsage(data as UsageLimit);
      return true;
    }

    return false;
  };

  const canScan = (): boolean => {
    if (!subscription) return false;

    const planLimits = PLAN_LIMITS[subscription.plan_id];
    if (!planLimits) return false;

    if (planLimits.dailyScans === -1) return true;

    const currentCount = usage?.meal_scans_count || 0;
    return currentCount < planLimits.dailyScans;
  };

  const remainingScans = (): number => {
    if (!subscription) return 0;
    return getRemainingScans(subscription.plan_id, usage?.meal_scans_count || 0);
  };

  const updateSubscription = async (planId: string): Promise<boolean> => {
    if (!userId || !subscription) return false;

    const { error } = await supabase
      .from('subscriptions')
      .update({ plan_id: planId, updated_at: new Date().toISOString() })
      .eq('id', subscription.id);

    if (!error) {
      await loadSubscription();
      return true;
    }

    return false;
  };

  const cancelSubscription = async (): Promise<boolean> => {
    if (!userId || !subscription) return false;

    const { error } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    if (!error) {
      await loadSubscription();
      return true;
    }

    return false;
  };

  const isTrialing = (): boolean => {
    if (!subscription || !subscription.trial_end) return false;
    return new Date(subscription.trial_end) > new Date();
  };

  const trialDaysRemaining = (): number => {
    if (!isTrialing() || !subscription?.trial_end) return 0;
    const end = new Date(subscription.trial_end);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return {
    subscription,
    usage,
    loading,
    canScan,
    remainingScans,
    incrementScanCount,
    updateSubscription,
    cancelSubscription,
    isTrialing,
    trialDaysRemaining,
    reload: loadSubscription,
  };
}
