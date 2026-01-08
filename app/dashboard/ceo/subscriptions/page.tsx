"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Sparkles, DollarSign, Users, TrendingUp, Calendar } from "lucide-react"
import { getProfessionalsWithDetails, type UserWithDetails } from "@/lib/firestore/ceo"
import { formatCurrency, formatDate } from "@/lib/utils/format"

export default function CEOSubscriptionsPage() {
  const { user } = useAuth()
  const [professionals, setProfessionals] = useState<UserWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfessionals()
  }, [])

  async function loadProfessionals() {
    setLoading(true)
    try {
      const data = await getProfessionalsWithDetails()
      setProfessionals(data)
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error)
    } finally {
      setLoading(false)
    }
  }

  const inTrial = professionals.filter((p) => p.subscriptionStatus === "premium_trial" && p.trial?.active).length
  const premium = professionals.filter((p) => p.subscriptionStatus === "premium" && p.subscription?.active).length
  const free = professionals.filter(
    (p) => p.subscriptionStatus === "free" || (!p.trial?.active && p.subscriptionStatus !== "premium"),
  ).length

  // Calculate MRR (Monthly Recurring Revenue) - R$ 9,90 per premium subscriber
  const mrr = premium * 9.9

  // Calculate conversion rate
  const totalProfessionals = professionals.length
  const conversionRate = totalProfessionals > 0 ? ((premium / totalProfessionals) * 100).toFixed(1) : "0.0"

  if (user?.role !== "ceo") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">Acesso negado</p>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Assinaturas</h2>
          <p className="text-muted-foreground mt-1">Gerenciar planos e assinaturas dos profissionais</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 dark:from-blue-500/10 dark:to-indigo-500/10 border-blue-600/30 dark:border-blue-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Premium Trial</p>
                <p className="text-3xl font-bold text-blue-950 dark:text-white mt-1">{inTrial}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Profissionais em teste</p>
              </div>
              <div className="p-3 bg-blue-700/30 dark:bg-blue-500/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-blue-900 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 dark:from-green-500/10 dark:to-emerald-500/10 border-green-600/30 dark:border-green-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">Premium Pago</p>
                <p className="text-3xl font-bold text-green-950 dark:text-white mt-1">{premium}</p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">Assinantes ativos</p>
              </div>
              <div className="p-3 bg-green-700/30 dark:bg-green-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-900 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Plano Free</p>
                <p className="text-3xl font-bold text-foreground mt-1">{free}</p>
                <p className="text-xs text-muted-foreground mt-1">Sem assinatura</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 dark:from-blue-500/10 dark:to-cyan-500/10 border-cyan-600/30 dark:border-blue-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-800 dark:text-blue-300">MRR</p>
                <p className="text-2xl font-bold text-cyan-950 dark:text-white mt-1">{formatCurrency(mrr)}</p>
                <p className="text-xs text-cyan-700 dark:text-blue-300 mt-1">Receita mensal recorrente</p>
              </div>
              <div className="p-3 bg-cyan-700/30 dark:bg-blue-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-cyan-900 dark:text-blue-400" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-card border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Taxa de Conversão</h3>
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">{conversionRate}%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {premium} de {totalProfessionals} profissionais converteram para o plano Premium
          </p>
        </Card>

        {loading ? (
          <Card className="bg-card border-border p-6">
            <p className="text-center text-muted-foreground">Carregando assinaturas...</p>
          </Card>
        ) : (
          <Card className="bg-card border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Profissionais Ativos</h3>
            <div className="space-y-3">
              {professionals
                .filter((p) => p.subscriptionStatus === "premium" && p.subscription?.active)
                .map((professional) => (
                  <div key={professional.uid} className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground">{professional.name}</p>
                          <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-600 dark:text-green-400">
                            Premium
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {professional.businessName || professional.email}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Desde {formatDate(professional.subscription?.startedAt || professional.createdAt)}
                          </span>
                          <span>{professional.appointmentsCount || 0} agendamentos</span>
                          <span>{professional.servicesCount || 0} serviços</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">R$ 9,90/mês</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          ID: {professional.subscription?.stripeCustomerId?.slice(-8)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

              {premium === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-2" />
                  <p>Nenhum profissional com assinatura Premium ainda</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
