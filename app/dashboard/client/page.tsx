"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { EnhancedStatCard } from "@/components/dashboard/enhanced-stat-card"
import { EmptyState } from "@/components/dashboard/empty-state"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Search, Phone, ArrowRight, MapPin } from "lucide-react"
import { getAppointmentsByClient } from "@/lib/firestore/appointments"
import type { Appointment } from "@/types/firestore"
import { formatDate } from "@/lib/utils/format"
import Link from "next/link"
import { useRouter } from "next/navigation"

function ClientDashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role !== "client") {
      router.replace("/dashboard")
    }
  }, [user, router])

  useEffect(() => {
    if (user?.uid) {
      loadAppointments()
    }
  }, [user])

  async function loadAppointments() {
    if (!user?.uid) return
    setLoading(true)
    try {
      const data = await getAppointmentsByClient(user.uid)
      setAppointments(data)
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status !== "cancelled" && apt.status !== "completed" && new Date(apt.date) >= new Date(),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      case "pending":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
      case "completed":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmado"
      case "pending":
        return "Pendente"
      case "cancelled":
        return "Cancelado"
      case "completed":
        return "Concluído"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando seus agendamentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground">
          Olá, <span className="text-gradient">{user?.name?.split(" ")[0] || "Cliente"}</span>!
        </h2>
        <p className="text-lg text-muted-foreground">Gerencie seus agendamentos e encontre profissionais</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <EnhancedStatCard
          title="Próximos"
          value={upcomingAppointments.length}
          subtitle="Agendamentos"
          icon={Calendar}
          variant="primary"
        />
        <EnhancedStatCard
          title="Total"
          value={appointments.length}
          subtitle="Agendamentos realizados"
          icon={Clock}
          variant="info"
        />
        <EnhancedStatCard
          title="Encontre"
          value="Profissionais"
          subtitle="Novos serviços"
          icon={Search}
          variant="primary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card-elevated shadow-lg">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Próximos Agendamentos</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Seus compromissos futuros</p>
              </div>
              <Link href="/dashboard/my-appointments">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-6">
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="group p-4 bg-secondary hover:bg-secondary/80 rounded-xl border border-border transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {appointment.serviceName}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {appointment.professionalName || "Profissional"}
                        </p>
                      </div>
                      <Badge
                        variant={appointment.status === "confirmed" ? "default" : "secondary"}
                        className={
                          appointment.status === "confirmed"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : appointment.status === "cancelled"
                              ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        }
                      >
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>
                          {appointment.startTime} - {appointment.endTime}
                        </span>
                      </div>
                      {appointment.professionalWhatsapp && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="w-3.5 h-3.5 text-primary" />
                          <span>{appointment.professionalWhatsapp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="Nenhum agendamento"
                description="Você ainda não tem agendamentos. Encontre profissionais e agende seu primeiro horário!"
                action={{
                  label: "Encontrar profissionais",
                  onClick: () => router.push("/dashboard/search"),
                }}
              />
            )}
          </div>
        </Card>

        <Card className="bg-card-elevated shadow-lg">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Ações Rápidas</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Acesso rápido às principais funções</p>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              <Link href="/dashboard/search">
                <Button className="w-full justify-between bg-primary hover:bg-primary/90 h-12 group">
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Encontrar profissionais
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                </Button>
              </Link>

              {[
                { href: "/dashboard/my-appointments", icon: Calendar, label: "Meus agendamentos" },
                { href: "/dashboard/profile", icon: MapPin, label: "Editar perfil" },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href}>
                  <Button
                    variant="outline"
                    className="w-full justify-between border-border hover:bg-secondary bg-transparent h-12 group"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      {label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-all" />
                  </Button>
                </Link>
              ))}
            </div>

            <Card className="mt-6 bg-gradient-to-br from-primary/10 via-primary/5 to-blue-500/10 border-primary/20">
              <div className="p-4">
                <p className="text-xs font-semibold text-primary mb-1.5">Dica</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Mantenha seu WhatsApp atualizado para receber confirmações dos profissionais
                </p>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function ClientDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ClientDashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
