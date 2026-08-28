import type { PlanTier } from '../types/profile';

export const PLAN_LIMITS: Record<PlanTier, number> = {
  free: 3,
  pro: 50,
  business: 300,
};

export const PLAN_PRICES_INR: Record<PlanTier, number> = {
  free: 0,
  pro: 499,
  business: 1999,
};

export function getPlanLimit(plan: PlanTier): number {
  return PLAN_LIMITS[plan];
}

export function getRemainingGenerations(
  plan: PlanTier,
  used: number,
): number {
  return Math.max(0, getPlanLimit(plan) - used);
}
