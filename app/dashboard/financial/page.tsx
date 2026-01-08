"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { PageHeaderEnhanced } from "@/components/dashboard/page-header-enhanced"
import { EnhancedStatCard } from "@/components/dashboard/enhanced-stat-card"
import { Card } from "@/components/ui/card"
import { DollarSign, TrendingUp, Calendar, ChevronLeft, ChevronRight, Info } from "lucide-react"
import { getFinancialSummary } from "@/lib/firestore/financial"
import type { FinancialSummary } from "@/types/firestore"
import { formatCurrency } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { canAccessFeature } from "@/lib/utils/plan-limits"
import { FeatureLockedOverlay } from "@/components/dashboard/feature-locked-overlay"
import { Badge } from "@/components/ui/badge"

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

function FinancialContent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const hasAccess = canAccessFeature(user, "financial")

  useEffect(() => {
    if (user?.uid && hasAccess) {
      loadFinancialData()
    } else {
      setLoading(false)
    }
  }, [user, selectedMonth, selectedYear, hasAccess])

  async function loadFinancialData() {
    if (!user?.uid) return
    setLoading(true)
    try {
      const data = await getFinancialSummary(user.uid, selectedMonth, selectedYear)
      setSummary(data)
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error)
    } finally {
      setLoading(false)
    }
  }

  function changeMonth(delta: number) {
    let newMonth = selectedMonth + delta
    let newYear = selectedYear

    if (newMonth < 0) {
      newMonth = 11
      newYear--
    } else if (newMonth > 11) {
      newMonth = 0
      newYear++
    }

    setSelectedMonth(newMonth)
    setSelectedYear(newYear)
  }

  function goToCurrentMonth() {
    setSelectedMonth(new Date().getMonth())
    setSelectedYear(new Date().getFullYear())
  }

  const isCurrentMonth = selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear()

  if (!hasAccess) {
    return (
      <FeatureLockedOverlay
        featureName="Relatórios Financeiros"
        description="Acompanhe o faturamento, ticket médio e desempenho do seu negócio com relatórios financeiros detalhados. Disponível apenas no plano Premium."
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando dados financeiros...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeaderEnhanced
        title="Financeiro"
        description="Acompanhe o desempenho financeiro e métricas do seu negócio"
        icon={DollarSign}
      />

      <Card className="glass-effect p-5 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeMonth(-1)}
            className="border-border hover:bg-secondary h-10 px-4"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">
                {monthNames[selectedMonth]} {selectedYear}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">Período selecionado</p>
            </div>
            {!isCurrentMonth && (
              <Button
                variant="outline"
                size="sm"
                onClick={goToCurrentMonth}
                className="border-primary/30 text-primary hover:bg-primary/10 h-9 bg-transparent"
              >
                Mês Atual
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => changeMonth(1)}
            className="border-border hover:bg-secondary h-10 px-4"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <EnhancedStatCard
          title="Faturamento Total"
          value={formatCurrency(summary?.totalRevenue || 0)}
          subtitle="Agendamentos confirmados e concluídos"
          icon={DollarSign}
          variant="success"
        />

        <EnhancedStatCard
          title="Total de Agendamentos"
          value={summary?.totalAppointments || 0}
          subtitle="Confirmados e concluídos"
          icon={Calendar}
          variant="primary"
        />

        <EnhancedStatCard
          title="Ticket Médio"
          value={formatCurrency(summary?.averageTicket || 0)}
          subtitle="Valor médio por agendamento"
          icon={TrendingUp}
          variant="info"
        />
      </div>

      <Card className="glass-effect p-6 border-info/20 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-info/10 rounded-xl">
            <Info className="w-6 h-6 text-info" />
          </div>
          <div className="flex-1 space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Sobre os dados financeiros</h3>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p className="flex items-center gap-2 flex-wrap">
                • Os valores consideram apenas agendamentos com status{" "}
                <Badge className="status-success">Confirmado</Badge> ou{" "}
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Concluído</Badge>
              </p>
              <p>• Agendamentos pendentes ou cancelados não são contabilizados</p>
              <p>• O ticket médio é calculado dividindo o faturamento total pelo número de agendamentos</p>
            </div>
          </div>
        </div>
      </Card>

      {summary && summary.totalAppointments === 0 && (
        <Card className="bg-card-elevated p-12 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="p-4 bg-muted rounded-2xl">
              <DollarSign className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Nenhum agendamento confirmado</h3>
              <p className="text-muted-foreground">
                Os dados financeiros aparecerão quando você tiver agendamentos confirmados ou concluídos neste período
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default function FinancialPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FinancialContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
