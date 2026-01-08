import type { User } from "@/types/auth"

export const PLAN_LIMITS = {
  free: {
    appointments: 10,
    services: 3,
    clients: 5,
    features: {
      financial: false,
      analytics: false,
      bulkActions: false,
    },
  },
  premium_trial: {
    appointments: Number.POSITIVE_INFINITY,
    services: Number.POSITIVE_INFINITY,
    clients: Number.POSITIVE_INFINITY,
    features: {
      financial: true,
      analytics: true,
      bulkActions: true,
    },
  },
  premium: {
    appointments: Number.POSITIVE_INFINITY,
    services: Number.POSITIVE_INFINITY,
    clients: Number.POSITIVE_INFINITY,
    features: {
      financial: true,
      analytics: true,
      bulkActions: true,
    },
  },
}

export function getPlanLimits(user: User | null) {
  const status = user?.subscriptionStatus || "free"
  return PLAN_LIMITS[status] || PLAN_LIMITS.free
}

export function canAccessFeature(user: User | null, feature: keyof typeof PLAN_LIMITS.free.features): boolean {
  const limits = getPlanLimits(user)
  return limits.features[feature]
}

export function hasReachedLimit(currentCount: number, limit: number): boolean {
  if (limit === Number.POSITIVE_INFINITY) return false
  return currentCount >= limit
}

export function getRemainingCount(currentCount: number, limit: number): number {
  if (limit === Number.POSITIVE_INFINITY) return Number.POSITIVE_INFINITY
  return Math.max(0, limit - currentCount)
}
