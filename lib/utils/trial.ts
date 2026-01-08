import type { User } from "@/types/auth"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { handleTrialExpirationResources } from "./plan-transition"

/**
 * Verifica se o trial do usuário está ativo
 * @param user - Usuário para verificar
 * @returns true se o trial está ativo, false caso contrário
 */
export function isTrialActive(user: User | null): boolean {
  // CEO não tem trial, sempre tem acesso total
  if (user?.role === "ceo") return true

  // Cliente não tem trial, sempre tem acesso
  if (user?.role === "client") return true

  // Profissional sem trial configurado
  if (!user?.trial) return false

  // Verifica se trial ainda está ativo
  const now = new Date()
  const endsAt = new Date(user.trial.endsAt)

  return user.trial.active && now < endsAt
}

/**
 * Verifica se o trial expirou e atualiza o status no Firestore
 * @param user - Usuário para verificar
 */
export async function checkAndUpdateTrialStatus(user: User | null): Promise<void> {
  if (!user || user.role !== "professional" || !user.trial) return

  // CEO nunca tem trial expirado
  if (user.role === "ceo") return

  const now = new Date()
  const endsAt = new Date(user.trial.endsAt)

  // Se o trial expirou mas ainda está marcado como ativo, atualizar
  if (user.trial.active && now >= endsAt && user.subscriptionStatus !== "premium") {
    try {
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        subscriptionStatus: "free",
        "trial.active": false,
      })

      await handleTrialExpirationResources(user.uid, {
        ...user,
        subscriptionStatus: "free",
        trial: { ...user.trial, active: false },
      })
    } catch (error) {
      console.error("Error updating trial status:", error)
    }
  }
}

/**
 * Calcula a data de término do trial (3 dias a partir de agora)
 * @param startDate - Data de início do trial
 * @returns Data de término do trial
 */
export function calculateTrialEndDate(startDate: Date): Date {
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 3)
  return endDate
}

/**
 * Retorna informações sobre o trial do usuário
 * @param user - Usuário para obter informações
 * @returns Informações do trial ou null
 */
export function getTrialInfo(user: User | null): {
  hasTrialAccess: boolean
  daysRemaining: number | null
  isExpired: boolean
} {
  // CEO sempre tem acesso total
  if (user?.role === "ceo") {
    return { hasTrialAccess: true, daysRemaining: null, isExpired: false }
  }

  // Cliente sempre tem acesso
  if (user?.role === "client") {
    return { hasTrialAccess: true, daysRemaining: null, isExpired: false }
  }

  // Profissional sem trial
  if (!user?.trial) {
    return { hasTrialAccess: false, daysRemaining: null, isExpired: true }
  }

  const now = new Date()
  const endsAt = new Date(user.trial.endsAt)
  const daysRemaining = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return {
    hasTrialAccess: user.trial.active && now < endsAt,
    daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
    isExpired: now >= endsAt,
  }
}
