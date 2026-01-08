export type UserRole = "professional" | "client" | "ceo"
export type SubscriptionStatus = "premium_trial" | "free" | "premium"

export interface TrialInfo {
  active: boolean
  startedAt: Date
  endsAt: Date
}

export interface PlanTransition {
  lastCheck?: string
  servicesDisabled?: number
  totalClients?: number
  totalAppointments?: number
  notified?: boolean
}

import type { StripeSubscription } from "./stripe"

export interface User {
  uid: string
  email: string
  whatsapp: string
  role: UserRole
  name: string
  businessName?: string
  businessType?: string
  createdAt: Date
  trial?: TrialInfo
  subscriptionStatus?: SubscriptionStatus
  subscription?: StripeSubscription
  planTransition?: PlanTransition
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  registerProfessional: (data: ProfessionalRegistrationData) => Promise<void>
  registerClient: (data: ClientRegistrationData) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

export interface ProfessionalRegistrationData {
  name: string
  email: string
  whatsapp: string
  businessName: string
  businessType: string
  password: string
}

export interface ClientRegistrationData {
  name: string
  email: string
  whatsapp: string
  password: string
}
