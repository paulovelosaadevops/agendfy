import type { Client } from "@/types/firestore"
import { getAppointmentsByProfessional } from "./appointments"

export async function getClientsByProfessional(professionalId: string): Promise<Client[]> {
  const appointments = await getAppointmentsByProfessional(professionalId)

  // Agrupar agendamentos por cliente
  const clientsMap = new Map<string, Client>()

  appointments.forEach((appointment) => {
    const key = appointment.clientWhatsapp

    if (clientsMap.has(key)) {
      const client = clientsMap.get(key)!
      client.totalAppointments++

      if (!client.lastAppointment || appointment.date > client.lastAppointment) {
        client.lastAppointment = appointment.date
      }
    } else {
      clientsMap.set(key, {
        id: key,
        professionalId,
        name: appointment.clientName,
        whatsapp: appointment.clientWhatsapp,
        totalAppointments: 1,
        lastAppointment: appointment.date,
        createdAt: appointment.createdAt,
      })
    }
  })

  return Array.from(clientsMap.values()).sort(
    (a, b) => (b.lastAppointment?.getTime() || 0) - (a.lastAppointment?.getTime() || 0),
  )
}
