export interface PlanFeatures {
  dailyScans: number;
  historyDays: number;
  aiChat: boolean;
  familyAccounts: number;
  exportData: boolean;
  adsEnabled: boolean;
  fitnessFeatures?: boolean;
}

export const PLAN_LIMITS: Record<string, PlanFeatures> = {
  free: {
    dailyScans: 3,
    historyDays: 7,
    aiChat: false,
    familyAccounts: 0,
    exportData: false,
    adsEnabled: true,
  },
  premium: {
    dailyScans: -1,
    historyDays: 30,
    aiChat: false,
    familyAccounts: 0,
    exportData: true,
    adsEnabled: false,
  },
  pro: {
    dailyScans: -1,
    historyDays: -1,
    aiChat: true,
    familyAccounts: 4,
    exportData: true,
    adsEnabled: false,
  },
  family: {
    dailyScans: -1,
    historyDays: -1,
    aiChat: true,
    familyAccounts: 6,
    exportData: true,
    adsEnabled: false,
  },
  fitness: {
    dailyScans: -1,
    historyDays: 30,
    aiChat: false,
    familyAccounts: 0,
    exportData: true,
    adsEnabled: false,
    fitnessFeatures: true,
  },
};

export const PLAN_PRICES = {
  free: { monthly: 0, yearly: 0 },
  premium: { monthly: 480, yearly: 4800 },
  pro: { monthly: 980, yearly: 9800 },
  family: { monthly: 1480, yearly: 14800 },
  fitness: { monthly: 680, yearly: 6800 },
};

export const PLAN_NAMES = {
  free: 'Free',
  premium: 'Premium',
  pro: 'Pro',
  family: 'Family',
  fitness: 'Fitness',
};

export function canPerformAction(
  planId: string,
  action: keyof PlanFeatures
): boolean {
  const plan = PLAN_LIMITS[planId];
  if (!plan) return false;

  const value = plan[action];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === -1 || value > 0;
  return false;
}

export function getRemainingScans(
  planId: string,
  usedScans: number
): number {
  const plan = PLAN_LIMITS[planId];
  if (!plan || plan.dailyScans === -1) return -1;
  return Math.max(0, plan.dailyScans - usedScans);
}

export function isUnlimited(planId: string, feature: keyof PlanFeatures): boolean {
  const plan = PLAN_LIMITS[planId];
  if (!plan) return false;
  const value = plan[feature];
  return typeof value === 'number' && value === -1;
}
