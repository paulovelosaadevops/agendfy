import { collection, getDocs, query, where, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { UserData, UserRole } from "@/types/auth"
import type { BusinessProfile } from "@/types/firestore"

export interface CEOMetrics {
  totalUsers: number
  totalClients: number
  totalProfessionals: number
  professionalsInTrial: number
  professionalsExpired: number
  totalAppointments: number
  monthAppointments: number
  estimatedRevenue: number
}

export interface UserWithDetails extends UserData {
  businessName?: string
  businessType?: string
  appointmentsCount?: number
  servicesCount?: number
}

export async function getCEOMetrics(): Promise<CEOMetrics> {
  try {
    // Total de usuários
    const usersSnap = await getDocs(collection(db, "users"))
    const users = usersSnap.docs
      .map((doc) => ({ ...doc.data(), uid: doc.id }) as UserData)
      .filter((u) => u.role !== "ceo") // Ignorar CEOs das contagens

    const totalUsers = users.length
    const totalClients = users.filter((u) => u.role === "client").length
    const totalProfessionals = users.filter((u) => u.role === "professional").length

    // Profissionais em trial
    const professionalsInTrial = users.filter(
      (u) => u.role === "professional" && u.subscriptionStatus === "premium_trial" && u.trial?.active,
    ).length

    // Profissionais com trial expirado
    const now = new Date()
    const professionalsExpired = users.filter((u) => {
      if (u.role !== "professional" || !u.trial) return false
      const endsAt = u.trial.endsAt instanceof Timestamp ? u.trial.endsAt.toDate() : new Date(u.trial.endsAt)
      return endsAt < now && u.subscriptionStatus === "free"
    }).length

    // Total de agendamentos
    const appointmentsSnap = await getDocs(collection(db, "appointments"))
    const totalAppointments = appointmentsSnap.size

    // Agendamentos do mês atual
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const monthStart = new Date(currentYear, currentMonth, 1)

    const monthAppointments = appointmentsSnap.docs.filter((doc) => {
      const data = doc.data()
      const date = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
      return date >= monthStart
    }).length

    // Receita estimada (baseado em agendamentos confirmados do mês)
    const confirmedAppointments = appointmentsSnap.docs.filter((doc) => {
      const data = doc.data()
      const date = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
      return date >= monthStart && (data.status === "confirmed" || data.status === "completed")
    })

    const estimatedRevenue = confirmedAppointments.reduce((sum, doc) => {
      return sum + (doc.data().price || 0)
    }, 0)

    return {
      totalUsers,
      totalClients,
      totalProfessionals,
      professionalsInTrial,
      professionalsExpired,
      totalAppointments,
      monthAppointments,
      estimatedRevenue,
    }
  } catch (error) {
    console.error("Erro ao buscar métricas CEO:", error)
    return {
      totalUsers: 0,
      totalClients: 0,
      totalProfessionals: 0,
      professionalsInTrial: 0,
      professionalsExpired: 0,
      totalAppointments: 0,
      monthAppointments: 0,
      estimatedRevenue: 0,
    }
  }
}

export async function getAllUsers(): Promise<UserWithDetails[]> {
  try {
    const usersSnap = await getDocs(collection(db, "users"))
    const users = usersSnap.docs
      .map((doc) => {
        const data = doc.data()
        return {
          uid: doc.id,
          email: data.email,
          name: data.name,
          role: data.role as UserRole,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
          subscriptionStatus: data.subscriptionStatus,
          trial: data.trial,
          businessName: data.businessName,
          whatsapp: data.whatsapp,
        } as UserWithDetails
      })
      .filter((u) => u.role !== "ceo") // Ignorar CEOs da listagem

    return users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return []
  }
}

export async function getProfessionalsWithDetails(): Promise<UserWithDetails[]> {
  try {
    const q = query(collection(db, "users"), where("role", "==", "professional"))
    const usersSnap = await getDocs(q)

    const professionals = await Promise.all(
      usersSnap.docs.map(async (doc) => {
        const data = doc.data()
        const userId = doc.id

        // Buscar dados do negócio
        const businessSnap = await getDocs(query(collection(db, "business"), where("__name__", "==", userId)))
        const businessData = businessSnap.docs[0]?.data() as BusinessProfile | undefined

        // Contar serviços
        const servicesSnap = await getDocs(query(collection(db, "services"), where("professionalId", "==", userId)))

        // Contar agendamentos
        const appointmentsSnap = await getDocs(
          query(collection(db, "appointments"), where("professionalId", "==", userId)),
        )

        return {
          uid: userId,
          email: data.email,
          name: data.name,
          role: data.role as UserRole,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
          subscriptionStatus: data.subscriptionStatus,
          trial: data.trial,
          businessName: businessData?.name || data.businessName,
          businessType: businessData?.type || data.businessType,
          whatsapp: data.whatsapp,
          servicesCount: servicesSnap.size,
          appointmentsCount: appointmentsSnap.size,
        } as UserWithDetails
      }),
    )

    return professionals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (error) {
    console.error("Erro ao buscar profissionais:", error)
    return []
  }
}

export interface RevenueByPeriod {
  month: string
  revenue: number
  appointments: number
}

export async function getRevenueByPeriod(months = 6): Promise<RevenueByPeriod[]> {
  try {
    const appointmentsSnap = await getDocs(collection(db, "appointments"))
    const now = new Date()
    const results: RevenueByPeriod[] = []

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

      const monthAppointments = appointmentsSnap.docs.filter((doc) => {
        const data = doc.data()
        const date = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
        return date >= monthStart && date <= monthEnd && (data.status === "confirmed" || data.status === "completed")
      })

      const revenue = monthAppointments.reduce((sum, doc) => sum + (doc.data().price || 0), 0)

      results.push({
        month: monthDate.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
        revenue,
        appointments: monthAppointments.length,
      })
    }

    return results
  } catch (error) {
    console.error("Erro ao buscar receita por período:", error)
    return []
  }
}
