import { getAppointmentsByProfessional } from "./appointments"
import type { FinancialSummary } from "@/types/firestore"

export async function getFinancialSummary(
  professionalId: string,
  month: number,
  year: number,
): Promise<FinancialSummary> {
  const appointments = await getAppointmentsByProfessional(professionalId)

  // Filtrar agendamentos do mês específico com status completed
  const monthAppointments = appointments.filter((appointment) => {
    const appointmentDate = appointment.date
    return (
      appointmentDate.getMonth() === month &&
      appointmentDate.getFullYear() === year &&
      (appointment.status === "completed" || appointment.status === "confirmed")
    )
  })

  const totalRevenue = monthAppointments.reduce((sum, apt) => sum + apt.price, 0)
  const totalAppointments = monthAppointments.length
  const averageTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0

  return {
    totalRevenue,
    totalAppointments,
    averageTicket,
    month: String(month + 1).padStart(2, "0"),
    year,
  }
}
