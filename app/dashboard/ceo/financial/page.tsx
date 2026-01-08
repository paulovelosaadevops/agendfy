"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  Building2,
  AlertCircle,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { getRevenueByPeriod, type RevenueByPeriod } from "@/lib/firestore/ceo"

interface StripeMetrics {
  mrr: number
  arr: number
  activeSubscriptions: number
  trialingSubscriptions: number
  canceledSubscriptions: number
  monthRevenue: number
  churnRate: string
}

interface Subscriber {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  status: string
  plan: string
  amount: number
  currency: string
  interval: string
  currentPeriodEnd: string
  createdAt: string
}

interface Trial {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  status: string
  trialEnd: string | null
  createdAt: string
}

interface RevenueMonth {
  month: string
  revenue: number
  subscriptions: number
}

export default function CEOFinancialPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<StripeMetrics | null>(null)
  const [revenueByMonth, setRevenueByMonth] = useState<RevenueMonth[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [trials, setTrials] = useState<Trial[]>([])
  const [professionalRevenue, setProfessionalRevenue] = useState<RevenueByPeriod[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError(null)

    try {
      // Fetch with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const stripeRes = await fetch("/api/stripe/subscriptions", {
        signal: controller.signal,
      }).catch(() => null)

      clearTimeout(timeoutId)

      if (stripeRes?.ok) {
        const stripeData = await stripeRes.json()
        if (stripeData.error) {
          setError(stripeData.error)
        }
        setMetrics(stripeData.metrics || null)
        setRevenueByMonth(stripeData.revenueByMonth || [])
        setSubscribers(stripeData.subscribers || [])
        setTrials(stripeData.trials || [])
      } else {
        setError("Não foi possível carregar dados do Stripe")
        setMetrics({
          mrr: 0,
          arr: 0,
          activeSubscriptions: 0,
          trialingSubscriptions: 0,
          canceledSubscriptions: 0,
          monthRevenue: 0,
          churnRate: "0.0",
        })
      }

      // Buscar receita dos profissionais
      try {
        const profRevenue = await getRevenueByPeriod(6)
        setProfessionalRevenue(profRevenue)
      } catch (e) {
        console.error("Erro ao carregar receita dos profissionais:", e)
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Timeout: servidor demorou para responder")
      } else {
        setError("Erro ao carregar dados")
      }
      setMetrics({
        mrr: 0,
        arr: 0,
        activeSubscriptions: 0,
        trialingSubscriptions: 0,
        canceledSubscriptions: 0,
        monthRevenue: 0,
        churnRate: "0.0",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  if (user?.role !== "ceo") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">Acesso negado</p>
      </div>
    )
  }

  const totalProfessionalRevenue = professionalRevenue.reduce((sum, item) => sum + item.revenue, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Financeiro do SaaS</h2>
            <p className="text-muted-foreground mt-1">Receita de assinaturas do AgendFy</p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="gap-2 bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {error && (
          <Card className="bg-destructive/10 border-destructive/30 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">{error}</p>
                <p className="text-sm text-muted-foreground">
                  Verifique se a integração do Stripe está configurada corretamente.
                </p>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto"></div>
              <p className="text-sm text-muted-foreground">Carregando dados do Stripe...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Métricas Principais - Assinaturas */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-600/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">MRR</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-white mt-1">
                      {formatCurrency(metrics?.mrr || 0)}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Receita Mensal Recorrente</p>
                  </div>
                  <div className="p-3 bg-green-700/30 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-900 dark:text-green-400" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-blue-600/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">ARR</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-white mt-1">
                      {formatCurrency(metrics?.arr || 0)}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Receita Anual Recorrente</p>
                  </div>
                  <div className="p-3 bg-blue-700/30 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-900 dark:text-blue-400" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600/20 to-violet-600/20 border-purple-600/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Assinantes Ativos</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-white mt-1">
                      {metrics?.activeSubscriptions || 0}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Pagando mensalmente</p>
                  </div>
                  <div className="p-3 bg-purple-700/30 rounded-lg">
                    <CreditCard className="w-6 h-6 text-purple-900 dark:text-purple-400" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-600/20 to-teal-600/20 border-cyan-600/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Receita do Mês</p>
                    <p className="text-3xl font-bold text-cyan-900 dark:text-white mt-1">
                      {formatCurrency(metrics?.monthRevenue || 0)}
                    </p>
                    <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">Pagamentos recebidos</p>
                  </div>
                  <div className="p-3 bg-cyan-700/30 rounded-lg">
                    <Calendar className="w-6 h-6 text-cyan-900 dark:text-cyan-400" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Métricas Secundárias */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="bg-card border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Em Trial</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{metrics?.trialingSubscriptions || 0}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </Card>

              <Card className="bg-card border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cancelados</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{metrics?.canceledSubscriptions || 0}</p>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <ArrowDownRight className="w-5 h-5 text-destructive" />
                  </div>
                </div>
              </Card>

              <Card className="bg-card border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Churn</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{metrics?.churnRate || "0.0"}%</p>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-warning" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Tabs de Conteúdo */}
            <Tabs defaultValue="revenue" className="space-y-6">
              <TabsList className="bg-secondary">
                <TabsTrigger value="revenue">Receita por Mês</TabsTrigger>
                <TabsTrigger value="subscribers">Assinantes</TabsTrigger>
                <TabsTrigger value="trials">Em Trial</TabsTrigger>
                <TabsTrigger value="professionals">Receita Profissionais</TabsTrigger>
              </TabsList>

              {/* Receita por Mês */}
              <TabsContent value="revenue">
                <Card className="bg-card border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Receita de Assinaturas por Período</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Período</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Receita</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                            Assinantes
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueByMonth.map((item, index) => (
                          <tr key={index} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4 text-foreground">{item.month}</td>
                            <td className="py-3 px-4 text-right text-green-500 font-semibold">
                              {formatCurrency(item.revenue)}
                            </td>
                            <td className="py-3 px-4 text-right text-muted-foreground">{item.subscriptions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              {/* Assinantes */}
              <TabsContent value="subscribers">
                <Card className="bg-card border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Assinantes Ativos ({subscribers.length})
                  </h3>
                  <div className="space-y-3">
                    {subscribers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum assinante ativo ainda</p>
                      </div>
                    ) : (
                      subscribers.map((sub) => (
                        <div key={sub.id} className="p-4 bg-secondary rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-foreground">{sub.customerName}</p>
                                <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                                  {sub.plan}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{sub.customerEmail}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Desde {formatDate(sub.createdAt)}</span>
                                <span>Renova em {formatDate(sub.currentPeriodEnd)}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-green-500">
                                {formatCurrency(sub.amount)}/{sub.interval === "month" ? "mês" : "ano"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* Em Trial */}
              <TabsContent value="trials">
                <Card className="bg-card border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Em Período de Trial ({trials.length})</h3>
                  <div className="space-y-3">
                    {trials.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum usuário em trial no momento</p>
                      </div>
                    ) : (
                      trials.map((trial) => (
                        <div key={trial.id} className="p-4 bg-secondary rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-foreground">{trial.customerName}</p>
                              <p className="text-sm text-muted-foreground">{trial.customerEmail}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Iniciou em {formatDate(trial.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              {trial.trialEnd && (
                                <Badge variant="outline" className="border-primary text-primary">
                                  Expira em {formatDate(trial.trialEnd)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* Receita dos Profissionais (Secundário) */}
              <TabsContent value="professionals">
                <Card className="bg-card border-border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">Receita Gerada pelos Profissionais</h3>
                    <Badge variant="outline" className="ml-2">
                      Dados para apresentação
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Volume de negócios gerado na plataforma (útil para apresentar a novos profissionais)
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2 mb-6">
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground">Total (6 meses)</p>
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(totalProfessionalRevenue)}</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground">Agendamentos</p>
                      <p className="text-2xl font-bold text-foreground">
                        {professionalRevenue.reduce((sum, item) => sum + item.appointments, 0)}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Período</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Receita</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                            Agendamentos
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {professionalRevenue.map((item, index) => (
                          <tr key={index} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4 text-foreground">{item.month}</td>
                            <td className="py-3 px-4 text-right text-muted-foreground">
                              {formatCurrency(item.revenue)}
                            </td>
                            <td className="py-3 px-4 text-right text-muted-foreground">{item.appointments}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
