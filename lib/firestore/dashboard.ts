import { getAppointmentsByDate, getAppointmentsByProfessional } from "./appointments"
import { getClientsByProfessional } from "./clients"
import { getFinancialSummary } from "./financial"
import type { DashboardStats } from "@/types/firestore"

export async function getDashboardStats(professionalId: string): Promise<DashboardStats> {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // Agendamentos de hoje
  const todayAppointments = await getAppointmentsByDate(professionalId, today)
  const confirmedToday = todayAppointments.filter(
    (apt) => apt.status === "confirmed" || apt.status === "pending",
  ).length

  // Total de clientes
  const clients = await getClientsByProfessional(professionalId)
  const totalClients = clients.length

  // Próximos agendamentos (próximos 7 dias)
  const allAppointments = await getAppointmentsByProfessional(professionalId)
  const upcomingAppointments = allAppointments
    .filter((apt) => {
      const aptDate = apt.date
      const diffDays = Math.ceil((aptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays >= 0 && diffDays <= 7 && (apt.status === "confirmed" || apt.status === "pending")
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5)

  // Faturamento do mês
  const financial = await getFinancialSummary(professionalId, currentMonth, currentYear)

  return {
    todayAppointments: confirmedToday,
    totalClients,
    nextAppointments: upcomingAppointments,
    monthRevenue: financial.totalRevenue,
  }
}
