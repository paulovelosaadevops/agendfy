// Plan limits configuration
export const FREE_PLAN_LIMITS = {
  services: 3,
  clients: 15,
  appointmentsPerMonth: 30,
} as const

export const PREMIUM_PLANS = ["premium", "premium_trial"] as const

export function isPremiumPlan(status: string | undefined): boolean {
  if (!status) return false
  return status === "premium" || status === "premium_trial"
}

export function canAddMore(currentCount: number, limit: number, status: string | undefined): boolean {
  if (isPremiumPlan(status)) return true
  return currentCount < limit
}

export function getRemainingCount(currentCount: number, limit: number, status: string | undefined): number {
  if (isPremiumPlan(status)) return Number.POSITIVE_INFINITY
  return Math.max(0, limit - currentCount)
}

// Get current month date range
export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}
