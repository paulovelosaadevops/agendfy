import type { User } from "@/types/auth"
import { FREE_PLAN_LIMITS, hasPremiumAccess } from "@/lib/plan-limits"
import { getServicesByProfessional, updateService } from "@/lib/firestore/services"
import { getAppointmentsByProfessional } from "@/lib/firestore/appointments"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

/**
 * Verifica e desabilita recursos excedentes quando o trial expira
 * Mantém os dados mas marca como inativos os que excedem o limite do plano free
 */
export async function handleTrialExpirationResources(
  userId: string,
  user: User,
): Promise<{
  servicesDisabled: number
  totalServices: number
  clientsCount: number
  appointmentsCount: number
}> {
  const isPremium = hasPremiumAccess(user.subscriptionStatus, user.trial?.active)
  if (isPremium) {
    return { servicesDisabled: 0, totalServices: 0, clientsCount: 0, appointmentsCount: 0 }
  }

  const services = await getServicesByProfessional(userId)
  const activeServices = services.filter((s) => s.status === "active")

  let servicesDisabled = 0

  if (activeServices.length > FREE_PLAN_LIMITS.services) {
    // Ordena por data de criação (mais recentes primeiro)
    const sortedServices = [...activeServices].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // Mantém apenas os primeiros N serviços ativos, desabilita o resto
    const servicesToDisable = sortedServices.slice(FREE_PLAN_LIMITS.services)

    for (const service of servicesToDisable) {
      await updateService(service.id, { status: "inactive" })
      servicesDisabled++
    }
  }

  const appointments = await getAppointmentsByProfessional(userId)
  const uniqueClients = new Set(appointments.map((apt) => apt.clientWhatsapp))

  const userRef = doc(db, "users", userId)
  await updateDoc(userRef, {
    "planTransition.lastCheck": new Date().toISOString(),
    "planTransition.servicesDisabled": servicesDisabled,
    "planTransition.totalClients": uniqueClients.size,
    "planTransition.totalAppointments": appointments.length,
    "planTransition.notified": false, // Reset notification flag
  })

  return {
    servicesDisabled,
    totalServices: services.length,
    clientsCount: uniqueClients.size,
    appointmentsCount: appointments.length,
  }
}

/**
 * Verifica se o usuário tem recursos excedentes que precisam ser gerenciados
 */
export async function checkExcessResources(
  userId: string,
  user: User,
): Promise<{
  hasExcess: boolean
  excessServices: number
  excessClients: number
  message: string
}> {
  const isPremium = hasPremiumAccess(user.subscriptionStatus, user.trial?.active)

  if (isPremium) {
    return { hasExcess: false, excessServices: 0, excessClients: 0, message: "" }
  }

  const services = await getServicesByProfessional(userId)
  const activeServices = services.filter((s) => s.status === "active")
  const excessServices = Math.max(0, activeServices.length - FREE_PLAN_LIMITS.services)

  const appointments = await getAppointmentsByProfessional(userId)
  const uniqueClients = new Set(appointments.map((apt) => apt.clientWhatsapp))
  const excessClients = Math.max(0, uniqueClients.size - FREE_PLAN_LIMITS.clients)

  const hasExcess = excessServices > 0 || excessClients > 0

  let message = ""
  if (excessServices > 0) {
    message += `Você tem ${excessServices} serviço(s) excedente(s). Os mais antigos foram desabilitados automaticamente. `
  }
  if (excessClients > 0) {
    message += `Você tem ${uniqueClients.size} clientes cadastrados. No plano gratuito, o limite é ${FREE_PLAN_LIMITS.clients}. Considere fazer upgrade para continuar expandindo sua base de clientes.`
  }

  return { hasExcess, excessServices, excessClients, message }
}

/**
 * Marca a notificação de transição como vista
 */
export async function markTransitionNotificationAsSeen(userId: string): Promise<void> {
  const userRef = doc(db, "users", userId)
  await updateDoc(userRef, {
    "planTransition.notified": true,
  })
}
