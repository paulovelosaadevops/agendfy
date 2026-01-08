"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { EnhancedStatCard } from "@/components/dashboard/enhanced-stat-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, DollarSign, TrendingUp, Plus, Clock, Phone, ArrowRight, Sparkles } from "lucide-react"
import { getDashboardStats } from "@/lib/firestore/dashboard"
import type { DashboardStats } from "@/types/firestore"
import { formatCurrency } from "@/lib/utils/format"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SubscriptionExpiredBanner } from "@/components/dashboard/subscription-expired-banner"
import { PublicBookingLink } from "@/components/dashboard/public-booking-link"

function ProfessionalDashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role !== "professional") {
      router.replace("/dashboard")
    }
  }, [user, router])

  useEffect(() => {
    if (user?.uid) {
      loadStats()
    }
  }, [user])

  async function loadStats() {
    if (!user?.uid) return
    setLoading(true)
    try {
      const data = await getDashboardStats(user.uid)
      setStats(data)
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
      setStats({
        todayAppointments: 0,
        totalClients: 0,
        monthRevenue: 0,
        nextAppointments: [],
      })
    } finally {
      setLoading(false)
    }
  }

  function getDaysRemaining(): number {
    if (!user?.trial?.endsAt) return 0
    const now = new Date()
    const end = new Date(user.trial.endsAt)
    const diff = end.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  function getSubscriptionDisplay(): { label: string; description: string; showTrial: boolean } {
    if (user?.subscriptionStatus === "premium_trial" && user?.trial?.active) {
      const daysLeft = getDaysRemaining()
      return {
        label: "Premium Trial",
        description: `${daysLeft} ${daysLeft === 1 ? "dia" : "dias"} restantes`,
        showTrial: true,
      }
    }
    if (user?.subscriptionStatus === "premium") {
      return {
        label: "Premium",
        description: "Plano ativo",
        showTrial: false,
      }
    }
    return {
      label: "Gratuito",
      description: "Plano básico",
      showTrial: false,
    }
  }

  const subscriptionInfo = getSubscriptionDisplay()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <SubscriptionExpiredBanner />

      <div className="space-y-3">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground">
          Bem-vindo, <span className="text-gradient">{user?.name?.split(" ")[0] || "Profissional"}</span>!
        </h2>
        <p className="text-lg text-muted-foreground">{user?.businessName || "Seu negócio"} - Visão geral do seu dia</p>
      </div>

      <PublicBookingLink />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <EnhancedStatCard
          title="Hoje"
          value={stats?.todayAppointments || 0}
          subtitle="Agendamentos"
          icon={Calendar}
          variant="primary"
        />
        <EnhancedStatCard
          title="Clientes"
          value={stats?.totalClients || 0}
          subtitle="Total cadastrados"
          icon={Users}
          variant="info"
        />
        <EnhancedStatCard
          title="Este mês"
          value={formatCurrency(stats?.monthRevenue || 0)}
          subtitle="Faturamento"
          icon={DollarSign}
          variant="success"
        />
        <EnhancedStatCard
          title={subscriptionInfo.label}
          value={subscriptionInfo.description}
          subtitle="Status da conta"
          icon={subscriptionInfo.showTrial ? Sparkles : TrendingUp}
          variant={subscriptionInfo.showTrial ? "primary" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card-elevated shadow-lg">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-foreground">Próximos Agendamentos</h3>
                <p className="text-sm text-muted-foreground">Agenda do dia</p>
              </div>
              <Link href="/dashboard/agenda">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-6">
            {stats?.nextAppointments && stats.nextAppointments.length > 0 ? (
              <div className="space-y-3">
                {stats.nextAppointments.map((appointment) => (
                  <Card
                    key={appointment.id}
                    className="bg-secondary border-border p-4 hover:border-border/60 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{appointment.clientName}</p>
                          <p className="text-sm text-muted-foreground">{appointment.serviceName}</p>
                        </div>
                        <Badge className={appointment.status === "confirmed" ? "status-success" : "status-pending"}>
                          {appointment.status === "confirmed" ? "Confirmado" : "Pendente"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{appointment.startTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{appointment.clientWhatsapp}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-muted rounded-2xl w-fit mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Nenhum agendamento próximo</p>
                <Button
                  onClick={() => router.push("/dashboard/agenda")}
                  className="mt-4 bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar agendamento
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card className="bg-card-elevated shadow-lg">
          <div className="p-6 border-b border-border">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-foreground">Ações Rápidas</h3>
              <p className="text-sm text-muted-foreground">Acesso rápido às principais funções</p>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <Link href="/dashboard/agenda">
                <Button className="w-full justify-start bg-primary hover:bg-primary/90 h-12 shadow-lg shadow-primary/20">
                  <Plus className="w-5 h-5 mr-3" />
                  Criar novo agendamento
                </Button>
              </Link>

              {[
                { href: "/dashboard/services", icon: Sparkles, label: "Adicionar serviço" },
                { href: "/dashboard/agenda", icon: Calendar, label: "Ver agenda completa" },
                { href: "/dashboard/financial", icon: DollarSign, label: "Relatório financeiro" },
                { href: "/dashboard/clients", icon: Users, label: "Gerenciar clientes" },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href}>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border hover:bg-secondary h-12 bg-transparent"
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {user?.subscriptionStatus === "premium_trial" && user?.trial?.active && (
        <Card className="glass-effect border-primary/20 p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="text-lg font-semibold text-foreground">Trial Premium Ativo</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Seu período de teste expira em{" "}
                <span className="font-semibold text-primary">
                  {getDaysRemaining()} {getDaysRemaining() === 1 ? "dia" : "dias"}
                </span>
                . Aproveite todas as funcionalidades premium sem limitações!
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default function ProfessionalDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProfessionalDashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
