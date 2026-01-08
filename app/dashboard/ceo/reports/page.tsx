"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { TrendingUp, Users, Building2, Calendar } from "lucide-react"
import { getCEOMetrics, getRevenueByPeriod, type CEOMetrics, type RevenueByPeriod } from "@/lib/firestore/ceo"
import { formatCurrency } from "@/lib/utils/format"

export default function CEOReportsPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<CEOMetrics | null>(null)
  const [revenue, setRevenue] = useState<RevenueByPeriod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [metricsData, revenueData] = await Promise.all([getCEOMetrics(), getRevenueByPeriod(6)])
      setMetrics(metricsData)
      setRevenue(revenueData)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== "ceo") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">Acesso negado</p>
      </div>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando relatórios...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const totalRevenue = revenue.reduce((sum, item) => sum + item.revenue, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Relatórios</h2>
          <p className="text-muted-foreground mt-1">Análise de crescimento e performance</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Crescimento de Usuários
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total de usuários</span>
                <span className="text-xl font-bold text-foreground">{metrics?.totalUsers || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Clientes</span>
                <span className="text-lg font-semibold text-foreground">{metrics?.totalClients || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Profissionais</span>
                <span className="text-lg font-semibold text-foreground">{metrics?.totalProfessionals || 0}</span>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Crescimento de Profissionais
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total cadastrados</span>
                <span className="text-xl font-bold text-foreground">{metrics?.totalProfessionals || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Em trial</span>
                <span className="text-lg font-semibold text-primary">{metrics?.professionalsInTrial || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Trial expirado</span>
                <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                  {metrics?.professionalsExpired || 0}
                </span>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Volume de Agendamentos
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total de agendamentos</span>
                <span className="text-xl font-bold text-foreground">{metrics?.totalAppointments || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Este mês</span>
                <span className="text-lg font-semibold text-foreground">{metrics?.monthAppointments || 0}</span>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Receita (6 meses)
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Receita total</span>
                <span className="text-xl font-bold text-green-400">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Este mês</span>
                <span className="text-lg font-semibold text-foreground">
                  {formatCurrency(metrics?.estimatedRevenue || 0)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
